package filesystem

import (
	"github.com/kk-mats/ccx-worker/domain/object/plugin"
	"github.com/kk-mats/ccx-worker/domain/object/query"
)

type Plugin interface {
	// Find a global plugin
	FindGlobal(kind plugin.Kind, id query.PluginID) (plugin.Plugin, error)

	// Find a private plugin
	FindPrivate(kind plugin.Kind, p *query.Plugin) (plugin.Plugin, error)

	// Fetch the plugin from prime
	// FetchPrivate(kind plugin.Kind, p *query.Plugin) (plugin.Plugin, error)

	// Tar
	Tar(p plugin.Path) (plugin.TarReader, error)

	// Sync all plugins
	SyncAll() error
}
