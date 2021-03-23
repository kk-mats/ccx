package query

import (
	"github.com/kk-mats/ccx-worker/constant"
)

type PluginID string

type PluginOwner string

type PluginName string

// PluginImage is the name of the docker image of the plugin
type PluginImage string

// PluginDockerfile is the relative path to the dockerfile within the plugin folder from its root
type PluginDockerfile string

// PluginCommand is the command used for invoking the plugin
type PluginCommand string

type PluginEntrypoint struct {
	Image      *PluginImage
	Dockerfile *PluginDockerfile
	Command    *PluginCommand
}

type Plugin struct {
	ID         PluginID
	Name       PluginName
	Owner      PluginOwner
	Entrypoint PluginEntrypoint
}

func (p Plugin) IsGlobal() bool {
	return string(p.Owner) == constant.PluginOwnerGlobal
}
