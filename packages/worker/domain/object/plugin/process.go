package plugin

import (
	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
)

type Process struct {
	id ID

	// Absolute path to the plugin directory
	path Path

	owner Owner

	kind Kind
}

func NewProcess(id string, path string, owner string) *Process {
	return &Process{
		id:    ID(id),
		path:  Path(path),
		owner: Owner(owner),
		kind:  Detect,
	}
}

func (p Process) ID() ID {
	return p.id
}
func (p Process) Path() Path {
	return p.path
}

func (p Process) Owner() Owner {
	return p.owner
}

func (p Process) Kind() Kind {
	return p.kind
}

func (p Process) Exec(q *query.Detect, w *value.WorkspacePaths, e *Executor) (*ExecResult, error) {
	return e.Process(q, w, &p)
}
