package plugin

import (
	"io"

	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
)

type Kind string

const (
	Detect  Kind = "detect"
	Analyze Kind = "analyze"
)

type ID string

type Owner string

type Path string

type TarReader io.ReadCloser

type Logs []byte

type StatusCode int64

type ExecResult struct {
	Logs       Logs
	StatusCode StatusCode
	Artifacts  value.ArtifactsArchiveWithoutLogs
}

type Executor struct {
	Container func(q *query.Detect, w *value.WorkspacePaths, p *Container) (*ExecResult, error)
	Process   func(q *query.Detect, w *value.WorkspacePaths, p *Process) (*ExecResult, error)
}

type Plugin interface {
	ID() ID
	Owner() Owner
	Kind() Kind
	Exec(q *query.Detect, w *value.WorkspacePaths, e *Executor) (*ExecResult, error)
	Path() Path
}
