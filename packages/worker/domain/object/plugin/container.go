package plugin

import (
	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
)

type Container struct {
	id ID

	// Absolute path to the plugin directory
	path Path

	owner Owner

	kind Kind
}

func NewContainer(id string, path string, owner string, kind Kind) *Container {
	return &Container{
		id:    ID(id),
		path:  Path(path),
		owner: Owner(owner),
		kind:  Detect,
	}
}

func (c Container) ID() ID {
	return c.id
}
func (c Container) Path() Path {
	return c.path
}

func (c Container) Owner() Owner {
	return c.owner
}

func (c Container) Kind() Kind {
	return c.kind
}

func (c Container) Exec(q *query.Detect, w *value.WorkspacePaths, e *Executor) (*ExecResult, error) {
	return e.Container(q, w, &c)
}
