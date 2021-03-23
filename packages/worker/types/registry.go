package types

import (
	"github.com/kk-mats/ccx-worker/domain/object/value"
	"github.com/kk-mats/ccx-worker/domain/repository/client"
	"github.com/kk-mats/ccx-worker/domain/repository/filesystem"
	"github.com/kk-mats/ccx-worker/domain/service"
)

type Service struct {
	Detect *service.Detect
}

type Repository struct {
	WorkspaceFilesystem filesystem.Workspace
	PluginFileSystem    filesystem.Plugin
	PrimeClient         client.Prime
	ContainerClient     client.Container
}

type Registry struct {
	GlobalConfig *value.GlobalConfig
	Service      *Service
	Repository   *Repository
}
