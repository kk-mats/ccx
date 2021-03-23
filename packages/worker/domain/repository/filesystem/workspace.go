package filesystem

import (
	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
)

type Workspace interface {
	// Create workspace directory for the query.
	Create(id query.ID) (*value.WorkspacePaths, error)

	// Fetches a revision of the given project into there.
	FetchRevision(id query.ID, user query.Querent, project query.Project, revision query.ProjectRevision) error

	// Write bytes in <workspaceRoot>/resources/:filename
	WriteResource(id query.ID, filename string, b []byte) error

	// Write bytes in <workspaceRoot>/artifacts/:filename
	WriteArtifact(id query.ID, filename string, b []byte) error

	// TarWorkspace creates a io.reader of tar of a workspace directory
	TarWorkspace(id query.ID) (value.WorkspaceArchive, error)

	UntarArtifactsWithoutLogs(id query.ID, artifacts value.ArtifactsArchiveWithoutLogs) error

	// TarArtifacts compresses <workspaceRoot>/artifacts into a tar file
	TarArtifacts(id query.ID) (value.ArtifactsArchive, error)

	// Delete workspace directory of the given query
	Delete(id query.ID) error

	// Delete all workspaces
	DeleteAll() error
}
