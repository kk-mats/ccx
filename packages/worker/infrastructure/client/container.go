package client

import (
	"bufio"
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/api/types/strslice"
	"github.com/docker/docker/client"
	"github.com/kk-mats/ccx-worker/domain/object/plugin"
	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
	specs "github.com/opencontainers/image-spec/specs-go/v1"
)

// Container is a client to operate container plugins
type Container struct {
	cli        *client.Client
	workerType *value.WorkerType

	// path to workspace directory in a container
	workspacePath string

	// path to artifacts directory in a container
	artifactsPath string
}

// NewContainer returns Container client
func NewContainer() *Container {
	cli, err := client.NewEnvClient()

	if err != nil {
		log.Fatalf("alert: failed to connect docker daemon: %s", err.Error())
	}

	ctx := context.Background()
	i, err := cli.Info(ctx)

	var workerType value.WorkerType
	var workspacePath string
	var artifactsPath string
	if err == nil {
		switch i.OSType {
		case "linux":
			{
				workerType = value.LinuxDocker
				workspacePath = "/tmp"
				artifactsPath = "/tmp/artifacts"
			}
		case "windows":
			{
				workerType = value.WindowsDocker
				workspacePath = "c:/tmp"
				artifactsPath = "c:/tmp/artifacts"
			}
		}
	}

	return &Container{
		cli:           cli,
		workerType:    &workerType,
		workspacePath: workspacePath,
		artifactsPath: artifactsPath,
	}
}

// Build an image of a container plugin
func (c Container) Build(ctx context.Context, tag string, reader plugin.TarReader) error {
	res, err := c.cli.ImageBuild(ctx, reader, types.ImageBuildOptions{
		Tags: []string{string(tag)},
	})
	if err != nil {
		return err
	}
	defer res.Body.Close()

	scanner := bufio.NewScanner(res.Body)
	for scanner.Scan() {
		if line := scanner.Text(); strings.HasPrefix(line, "{\"errorDetail\":") {
			return fmt.Errorf("error: failed to build a container image of %s: %s", tag, line)
		}
	}

	return err
}

// Create a container from the image of a container plugin
func (c Container) Create(ctx context.Context, id query.ID, tag string, workspace value.WorkspaceRoot) (string, error) {
	cc := &container.Config{
		Cmd:             strslice.StrSlice([]string{c.workspacePath}),
		Image:           string(tag),
		Tty:             true,
		NetworkDisabled: true,
	}

	hc := &container.HostConfig{
		NetworkMode: "none",
	}

	info, err := c.cli.Info(ctx)

	if err != nil {
		return "", err
	}

	spec := &specs.Platform{
		Architecture: info.Architecture,
		OS:           info.OSType,
		OSVersion:    info.OSVersion,
	}

	log.Printf("trace: creating container with container config: %+v, host config: %+v, platform spec: %+v", cc, hc, spec)
	res, err := c.cli.ContainerCreate(ctx, cc, hc, &network.NetworkingConfig{}, spec, string(id))
	if err != nil {
		return "", err
	}
	return res.ID, nil
}

// Start a container
func (c Container) Start(ctx context.Context, id string) error {
	return c.cli.ContainerStart(ctx, id, types.ContainerStartOptions{})
}

// Remove a container
func (c Container) Remove(ctx context.Context, id string) error {
	return c.cli.ContainerRemove(ctx, id, types.ContainerRemoveOptions{Force: true})
}

func (c Container) CopyWorkspaceToContainer(ctx context.Context, id string, workspace value.WorkspaceArchive) error {
	return c.cli.CopyToContainer(ctx, id, c.workspacePath, workspace, types.CopyToContainerOptions{})
}

func (c Container) CopyArtifactsFromContainer(ctx context.Context, id string) (value.ArtifactsArchiveWithoutLogs, error) {
	reader, _, err := c.cli.CopyFromContainer(ctx, id, c.artifactsPath)
	if err != nil {
		return nil, err
	}

	defer reader.Close()
	return ioutil.ReadAll(reader)
}

// Wait until the container process exits
func (c Container) Wait(ctx context.Context, id string) (plugin.StatusCode, error) {
	var status container.ContainerWaitOKBody
	statusCh, errCh := c.cli.ContainerWait(ctx, id, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		{
			if err != nil {
				return plugin.StatusCode(-1), err
			}
		}
	case status = <-statusCh:
	}

	return plugin.StatusCode(status.StatusCode), nil
}

// FetchLogs fetches logs in a slice of bytes
func (c Container) FetchLogs(ctx context.Context, id string) (plugin.Logs, error) {
	reader, err := c.cli.ContainerLogs(ctx, id, types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})
	if err != nil {
		return nil, err
	}

	defer reader.Close()
	return ioutil.ReadAll(reader)
}

// Kill terminates the container process
func (c Container) Kill(ctx context.Context, id string) error {
	return c.cli.ContainerKill(ctx, id, "SIGKILL")
}

func (c Container) OSType() *value.WorkerType {
	return c.workerType
}
