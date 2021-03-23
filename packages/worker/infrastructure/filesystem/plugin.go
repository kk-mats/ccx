package filesystem

import (
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"

	"github.com/docker/docker/pkg/archive"
	"github.com/go-git/go-git/v5"

	"github.com/kk-mats/ccx-worker/constant"
	"github.com/kk-mats/ccx-worker/domain/object/plugin"
	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
)

type Plugin struct {
	pluginsRoot string
	globalRoot  string
	privateRoot string
	gitAddr     string
}

func NewPlugin(global *value.GlobalConfig) *Plugin {
	p := Plugin{
		pluginsRoot: filepath.Join(global.Worker.Store, "plugins"),
		globalRoot:  filepath.Join(global.Worker.Store, "plugins", "global"),
		privateRoot: filepath.Join(global.Worker.Store, "plugins", "private"),
		gitAddr:     global.Prime.GitAddr,
	}
	err := p.SyncAll()

	switch err {
	case git.ErrRepositoryNotExists:
		{
			p.clone()
		}
	case git.NoErrAlreadyUpToDate:
		{
			log.Println("info: plugins are already up-to-date.")
			break
		}
	default:
		{
			log.Fatalf("alert: %v", err.Error())
		}
	}

	return &p
}

// <pluginsRoot>/global/<kind>/<id>
func (p Plugin) resolveGlobalPath(kind plugin.Kind, id query.PluginID) string {
	path := filepath.Join(p.globalRoot, string(kind), string(id))
	return path
}

// <pluginsRoot>/private/<owner>/<kind>/<id>
func (p Plugin) resolvePrivatePath(owner string, kind plugin.Kind, id query.PluginID) string {
	path := filepath.Join(p.privateRoot, string(owner), string(kind), string(id))
	log.Printf("trace: read private plugin at %s", path)
	return path
}

func (p Plugin) readPlugin(path string, id query.PluginID, owner string, kind plugin.Kind) (plugin.Plugin, error) {
	files, err := ioutil.ReadDir(path)

	if err == nil {
		for _, file := range files {
			if file.Name() == "Dockerfile" && !file.IsDir() {
				return plugin.NewContainer(string(id), path, owner, kind), nil
			}
		}

		return plugin.NewProcess(string(id), path, owner), nil
	}

	return nil, err
}

// FindGlobal finds a global plugin
func (p Plugin) FindGlobal(kind plugin.Kind, id query.PluginID) (plugin.Plugin, error) {
	return p.readPlugin(p.resolveGlobalPath(kind, id), id, constant.PluginOwnerGlobal, kind)
}

// FindPrivate finds a private plugin
func (p Plugin) FindPrivate(kind plugin.Kind, qp *query.Plugin) (plugin.Plugin, error) {
	return p.readPlugin(p.resolvePrivatePath(string(qp.Owner), kind, qp.ID), qp.ID, constant.PluginOwnerGlobal, kind)
}

// FetchPrivate fetches a private plugin from prime
/*
func (p Plugin) FetchPrivate(kind plugin.Kind, qp *query.Plugin) (plugin.Plugin, error) {
	u := url.URL{
		Scheme: "git",
		Host:   fmt.Sprintf("%s:%d", p.primeHost, p.gitPort),
		Path:   "/plugins/global",
	}

	_, err := git.PlainClone(p.resolvePrivatePath(string(qp.Owner), kind, qp.ID), false, &git.CloneOptions{
		URL:   u.String(),
		Depth: 1,
	})

	if err != nil {
		return p.FindPrivate(kind, qp)
	}

	return nil, err
}
*/

// Tar a directory of the plugin
func (p Plugin) Tar(qp plugin.Path) (plugin.TarReader, error) {
	return archive.TarWithOptions(string(qp), &archive.TarOptions{})
}

func (p Plugin) clone() {
	u := fmt.Sprintf("git://%s/plugins/.git", p.gitAddr)

	_, err := git.PlainClone(p.pluginsRoot, false, &git.CloneOptions{URL: u})
	if err != nil {
		log.Fatalf("alert: failed to fetch global plugins from %s: %v", u, err.Error())
	}
}

// SyncAll synchronizes all plugins
func (p Plugin) SyncAll() error {
	r, err := git.PlainOpen(p.pluginsRoot)
	if err != nil {
		return err
	}

	w, err := r.Worktree()
	if err != nil {
		return err
	}
	return w.Pull(&git.PullOptions{Force: true})
}
