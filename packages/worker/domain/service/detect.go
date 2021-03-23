package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"

	"github.com/kk-mats/ccx-worker/domain/object/plugin"
	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
	"github.com/kk-mats/ccx-worker/domain/repository/client"
	"github.com/kk-mats/ccx-worker/domain/repository/filesystem"
)

// Detect is a service to detect code clones from a project with a detect plugin
type Detect struct {
	wr filesystem.Workspace
	pr filesystem.Plugin
	pc client.Prime
	cc client.Container
}

func (d Detect) writeQuery(q *query.Detect) error {

	j, err := json.Marshal(&map[string]interface{}{
		"targets":         q.Targets,
		"detectorVersion": q.Args.DetectorVersion,
		"parameters":      q.Args.Parameters,
	})

	if err == nil {
		if err = d.wr.WriteResource(q.ID, "query.json", j); err == nil {
			log.Printf("trace: [detect/%s] wrote detection query", q.ID)
		}
	}
	return err
}

func (d Detect) fetchRevision(q *query.Detect, r *query.Target) error {
	err := d.wr.FetchRevision(q.ID, q.User, q.Project, r.Revision)
	if err == nil {
		log.Printf("trace: [detect/%s] fetched a snapshot of %s of %s/%s.", q.ID, r.Revision, q.User, q.Project)
	}
	return err
}

func (d Detect) resolvePlugin(q *query.Detect) (plugin.Plugin, error) {
	if q.Plugin.IsGlobal() {
		return d.pr.FindGlobal(plugin.Detect, q.Plugin.ID)
	}

	pl, err := d.pr.FindPrivate(plugin.Detect, &q.Plugin)
	if err != nil {
		// pl, err = d.pr.FetchPrivate(plugin.Detect, &q.Plugin)
	}

	return pl, err
}

func (d Detect) setUp(q *query.Detect) (plugin.Plugin, error) {
	// Write parameters in <workspaceRoot>/in/parameters
	if err := d.writeQuery(q); err != nil {
		return nil, err
	}

	// Fetch source code for each revision
	for _, r := range q.Targets {
		if err := d.fetchRevision(q, &r); err != nil {
			return nil, err
		}
	}

	// resolve plugin
	pl, err := d.resolvePlugin(q)
	if err == nil {
		log.Printf("trace: [detect/%s] detect plugin %s found.", q.ID, pl.ID())
	}

	return pl, err
}

func (d Detect) finalize(queryID query.ID, logs plugin.Logs, artifacts value.ArtifactsArchiveWithoutLogs) (value.ArtifactsArchive, error) {
	if err := d.wr.UntarArtifactsWithoutLogs(queryID, artifacts); err != nil {
		return nil, err
	}

	// save log
	if err := d.wr.WriteArtifact(queryID, "out.log", logs); err != nil {
		return nil, err
	}
	log.Printf("trace: [detect/%s] wrote plugin logs.", queryID)

	return d.wr.TarArtifacts(queryID)

}

func (d Detect) runContainer(ctx context.Context, queryID query.ID, entrypoint *query.PluginEntrypoint, w *value.WorkspacePaths, cp plugin.TarReader, p *plugin.Container) (string, error) {
	var imageTag string
	if entrypoint.Dockerfile != nil {
		var id string
		imageTag = fmt.Sprintf("ccx-%s-%s-%s:latest", p.Owner(), p.Kind(), p.ID())
		err := d.cc.Build(ctx, imageTag, cp)
		if err != nil {
			return id, err
		}
		log.Printf("trace: [detect/%s] built a plugin image as %s.", queryID, imageTag)
	} else {
		imageTag = string(*entrypoint.Image)
	}

	id, err := d.cc.Create(ctx, queryID, imageTag, w.Root)
	if err != nil {
		return id, err
	}
	log.Printf("trace: [detect/%s] created container %s from image %s.", queryID, id, imageTag)

	workspace, err := d.wr.TarWorkspace(queryID)
	if err != nil {
		return id, err
	}
	defer workspace.Close()

	if err = d.cc.CopyWorkspaceToContainer(ctx, id, workspace); err != nil {
		return id, err
	}
	log.Printf("trace: [detect/%s] copied workspace to container %s.", queryID, id)

	return id, d.cc.Start(ctx, id)
}

func (d Detect) execContainer(q *query.Detect, w *value.WorkspacePaths, p *plugin.Container) (*plugin.ExecResult, error) {
	reader, err := d.pr.Tar(p.Path())
	if err != nil {
		return nil, err
	}
	log.Printf("trace: [detect/%s] archived %s directory.", q.ID, p.ID())

	ctx := context.Background()
	id, err := d.runContainer(ctx, q.ID, &q.Plugin.Entrypoint, w, reader, p)
	if err != nil {
		return nil, err
	}
	defer d.cc.Remove(ctx, id)

	r := plugin.ExecResult{}
	r.StatusCode, err = d.cc.Wait(ctx, id)
	if err != nil {
		return nil, err
	}
	log.Printf("trace: [detect/%s] finished to run the plugin container.", q.ID)

	artifacts, err := d.cc.CopyArtifactsFromContainer(ctx, id)
	if err != nil {
		return nil, err
	}
	log.Printf("trace: [detect/%s] copied artifacts from container %s.", q.ID, id)

	r.Logs, err = d.cc.FetchLogs(ctx, id)
	if err != nil {
		return nil, err
	}

	r.Artifacts = artifacts
	return &r, err
}

func (d Detect) execProcess(q *query.Detect, w *value.WorkspacePaths, p *plugin.Process) (*plugin.ExecResult, error) {
	if q.Plugin.Entrypoint.Command == nil {
		return nil, fmt.Errorf("Plugin.Entrypoint.Command is required for process plugin: %s", q.Plugin.Name)
	}

	cmd := exec.Command(string(*q.Plugin.Entrypoint.Command), string(w.Root))
	cmd.Dir = string(p.Path())

	err := cmd.Run()
	if err != nil {
		logs, outputErr := cmd.CombinedOutput()
		if outputErr != nil {
			return &plugin.ExecResult{
				Logs:       nil,
				StatusCode: plugin.StatusCode(-1),
			}, outputErr
		}

		return &plugin.ExecResult{
			Logs:       logs,
			StatusCode: plugin.StatusCode(-1),
		}, outputErr
	}

	logs, err := cmd.CombinedOutput()
	if err != nil {
		return &plugin.ExecResult{
			Logs:       nil,
			StatusCode: plugin.StatusCode(-1),
		}, err
	}

	return &plugin.ExecResult{
		Logs:       logs,
		StatusCode: plugin.StatusCode(-1),
	}, nil
}

// Exec starts and waits for clone detection
func (d Detect) Exec(q *query.Detect) (artifacts value.ArtifactsArchive, err error) {
	// create workspace and fetch project
	w, err := d.wr.Create(q.ID)
	if err != nil {
		return nil, err
	}
	log.Printf("trace: [detect/%s] created workspace.", q.ID)

	p, err := d.setUp(q)
	if err != nil {
		return nil, err
	}

	e := &plugin.Executor{
		Container: d.execContainer,
		Process:   d.execProcess,
	}
	r, err := p.Exec(q, w, e)
	if err != nil {
		return nil, err
	}

	return d.finalize(q.ID, r.Logs, r.Artifacts)
}

// NewDetect returns Detect service instance
func NewDetect(wr filesystem.Workspace, pr filesystem.Plugin, pc client.Prime, cc client.Container) *Detect {
	return &Detect{
		wr: wr,
		pr: pr,
		pc: pc,
		cc: cc,
	}
}
