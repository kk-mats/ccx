package value

import "io"

// WorkspaceRoot is an absolute path to the root directory of workspace.
type WorkspaceRoot string

// WorkspaceResources is an absolute path to <workspaceRoot>/resources.
type WorkspaceResources string

// WorkspaceArtifacts is an absolute path to <workspaceRoot>/artifacts.
type WorkspaceArtifacts string

// WorkspacePaths is a set of paths of workspace root, resources, and artifacts.
type WorkspacePaths struct {
	Root      WorkspaceRoot
	Resources WorkspaceResources
	Artifacts WorkspaceArtifacts
}

// ArtifactsArchive is a `io.ReadCloser` to an artifacts archived in tar format.
type ArtifactsArchive io.ReadCloser

// ArtifactsArchiveWithoutLogs is a byte slice of an artifacts without logs archived in tar format.
type ArtifactsArchiveWithoutLogs []byte

// WorkspaceArchive is a `io.ReadCloser` to the workspace archived in tar format.
type WorkspaceArchive io.ReadCloser
