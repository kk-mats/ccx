package registry

import (
	"github.com/kk-mats/ccx-worker/domain/object/value"
	"github.com/kk-mats/ccx-worker/domain/service"
	"github.com/kk-mats/ccx-worker/infrastructure/client"
	"github.com/kk-mats/ccx-worker/infrastructure/filesystem"
	"github.com/kk-mats/ccx-worker/types"
)

func NewRegistry(global *value.GlobalConfig, cc *client.Container) *types.Registry {
	r := &types.Repository{
		WorkspaceFilesystem: filesystem.NewWorkspace(global),
		PluginFileSystem:    filesystem.NewPlugin(global),
		ContainerClient:     cc,
	}

	return &types.Registry{
		GlobalConfig: global,
		Repository:   r,
		Service: &types.Service{
			Detect: service.NewDetect(r.WorkspaceFilesystem, r.PluginFileSystem, r.PrimeClient, r.ContainerClient),
		},
	}
}
