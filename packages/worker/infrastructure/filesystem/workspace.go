package filesystem

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/docker/docker/pkg/archive"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
)

type Workspace struct {
	workspaceRoot string
	gitAddr       string
}

func NewWorkspace(global *value.GlobalConfig) *Workspace {
	w := Workspace{
		workspaceRoot: filepath.Join(global.Worker.Store, "ws"),
		gitAddr:       global.Prime.GitAddr,
	}

	if err := os.MkdirAll(w.workspaceRoot, os.ModeDir); err != nil {
		log.Fatalf("alert: failed to create directories of %s: %s", w.workspaceRoot, err.Error())
	}

	return &w
}

// Create workspace directory for the query.
func (w Workspace) Create(id query.ID) (*value.WorkspacePaths, error) {
	root := filepath.Join(w.workspaceRoot, string(id))
	p := &value.WorkspacePaths{
		Root:      value.WorkspaceRoot(root),
		Resources: w.resolveResource(id),
		Artifacts: w.resolveArtifacts(id),
	}

	err := os.MkdirAll(string(p.Resources), os.ModeDir)
	if err == nil {
		err = os.MkdirAll(string(p.Artifacts), os.ModeDir)
	}
	return p, err
}

func (w Workspace) resolveRoot(id query.ID) value.WorkspaceRoot {
	return value.WorkspaceRoot(filepath.Join(w.workspaceRoot, string(id)))
}
func (w Workspace) resolveResource(id query.ID) value.WorkspaceResources {
	return value.WorkspaceResources(filepath.Join(w.workspaceRoot, string(id), "resources"))
}

func (w Workspace) resolveArtifacts(id query.ID) value.WorkspaceArtifacts {
	return value.WorkspaceArtifacts(filepath.Join(w.workspaceRoot, string(id), "artifacts"))
}

// FetchRevision fetches a revision of the given project into there.
func (w Workspace) FetchRevision(id query.ID, user query.Querent, project query.Project, revision query.ProjectRevision) error {
	path := filepath.Join(string(w.resolveResource(id)), "repo", string(revision))
	repo, err := git.PlainInit(path, false)
	if err != nil {
		return err
	}

	remote, err := repo.CreateRemote(&config.RemoteConfig{
		Name: "origin",
		URLs: []string{fmt.Sprintf("git://%s/projects/%s/%s/repo/.git", w.gitAddr, user, project)},
	})
	if err != nil {
		return err
	}

	err = remote.Fetch(&git.FetchOptions{
		RemoteName: "origin",
		RefSpecs:   []config.RefSpec{config.RefSpec(fmt.Sprintf("%s:refs/heads/master", revision))},
		Depth:      1,
		Tags:       git.NoTags,
	})
	if err != nil {
		return err
	}

	wt, err := repo.Worktree()
	if err != nil {
		return err
	}

	return wt.Checkout(&git.CheckoutOptions{})
}

func (w Workspace) writeWorkspaceFile(path string, b []byte) error {
	file, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0666)
	if err == nil {
		defer file.Close()
		_, err = file.Write(b)
	}

	return err
}

// WriteResource writes bytes in <workspaceRoot>/resources/:filename.
func (w Workspace) WriteResource(id query.ID, filename string, b []byte) error {
	return w.writeWorkspaceFile(filepath.Join(string(w.resolveResource(id)), filename), b)
}

// WriteArtifact writes bytes in <workspaceRoot>/artifacts/:filename.
func (w Workspace) WriteArtifact(id query.ID, filename string, b []byte) error {
	return w.writeWorkspaceFile(filepath.Join(string(w.resolveArtifacts(id)), filename), b)
}

func (w Workspace) TarWorkspace(id query.ID) (value.WorkspaceArchive, error) {
	path := string(w.resolveRoot(id))
	return archive.TarWithOptions(path, &archive.TarOptions{})
}

func (w Workspace) UntarArtifactsWithoutLogs(id query.ID, artifacts value.ArtifactsArchiveWithoutLogs) error {
	path := string(w.resolveRoot(id))
	return archive.Untar(bytes.NewReader(artifacts), path, &archive.TarOptions{})
}

// TarArtifacts compresses <workspaceRoot>/artifacts into a tar file
func (w Workspace) TarArtifacts(id query.ID) (value.ArtifactsArchive, error) {
	path := string(w.resolveArtifacts(id))
	return archive.Tar(path, archive.Uncompressed)
}

// Delete workspace directory of the given query.
func (w Workspace) Delete(id query.ID) error {
	return os.RemoveAll(string(w.resolveRoot(id)))
}

func (w Workspace) DeleteAll() error {
	return os.RemoveAll(string(w.workspaceRoot))
}
