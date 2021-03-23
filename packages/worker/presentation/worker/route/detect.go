package route

import (
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kk-mats/ccx-worker/presentation"

	"github.com/kk-mats/ccx-worker/domain/object/query"
	"github.com/kk-mats/ccx-worker/domain/object/value"
	"github.com/kk-mats/ccx-worker/types"
)

type detectReqTarget struct {
	Directory string `bindling:"required"`
	Revision  string `bindling:"required"`
}

type detectReqPluginEntrypoint struct {
	Image      *string `binding:"omitempty"`
	Dockerfile *string `binding:"omitempty"`
	Command    *string `binding:"omitempty"`
}

type detectReqMixedPluginEntrypoint struct {
	Windows *detectReqPluginEntrypoint `binding:"omitempty,dive"`
	Linux   *detectReqPluginEntrypoint `binding:"omitempty,dive"`
}

type detectReqPlugin struct {
	ID         string                         `binding:"required"`
	Name       string                         `binding:"required"`
	Owner      string                         `binding:"required"`
	Entrypoint detectReqMixedPluginEntrypoint `binding:"dive"`
}

type detectReqDetector struct {
	ID      string `binding:"required"`
	Name    string `binding:"required"`
	Version string `binding:"required"`
}

type detectReqArgs struct {
	DetectorVersion string                 `binding:"required"`
	Parameters      map[string]interface{} `binding:"required"`
}

type detectReq struct {
	ID      string            `binding:"required"`
	User    string            `binding:"required"`
	Project string            `binding:"required"`
	Plugin  detectReqPlugin   `binding:"dive"`
	Targets []detectReqTarget `binding:"dive"`
	Args    detectReqArgs     `binding:"dive"`
}

func detectPostHandler(r *types.Registry) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req detectReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			log.Printf("warn: invalid detect query format: %s", err.Error())
			return
		}

		Targets := make([]query.Target, 0, len(req.Targets))

		for _, t := range req.Targets {
			Targets = append(Targets, query.Target{
				Directory: query.ProjectDirectory(t.Directory),
				Revision:  query.ProjectRevision(t.Revision),
			})
		}

		var entrypoint query.PluginEntrypoint
		if req.Plugin.Entrypoint.Linux != nil {
			if *r.GlobalConfig.Worker.WorkerType == value.Linux || *r.GlobalConfig.Worker.WorkerType == value.LinuxDocker {
				entrypoint = query.PluginEntrypoint{
					Command:    (*query.PluginCommand)(req.Plugin.Entrypoint.Linux.Command),
					Dockerfile: (*query.PluginDockerfile)(req.Plugin.Entrypoint.Linux.Dockerfile),
					Image:      (*query.PluginImage)(req.Plugin.Entrypoint.Linux.Image),
				}
			} else {
				log.Printf("error: Received the detect request for Linux, but worker type is %s", *r.GlobalConfig.Worker.WorkerType)
				return
			}
		} else if req.Plugin.Entrypoint.Windows != nil {
			if *r.GlobalConfig.Worker.WorkerType == value.Windows || *r.GlobalConfig.Worker.WorkerType == value.WindowsDocker {
				entrypoint = query.PluginEntrypoint{
					Command:    (*query.PluginCommand)(req.Plugin.Entrypoint.Windows.Command),
					Dockerfile: (*query.PluginDockerfile)(req.Plugin.Entrypoint.Windows.Dockerfile),
					Image:      (*query.PluginImage)(req.Plugin.Entrypoint.Windows.Image),
				}
			} else {
				log.Printf("error: Received the detect request for Windows, but worker type is %s", *r.GlobalConfig.Worker.WorkerType)
				return
			}
		} else {
			log.Printf("error: Received the detect request without plugin entrypoint, worker type is %s", *r.GlobalConfig.Worker.WorkerType)
			return
		}

		q := query.Detect{
			ID:   query.ID(req.ID),
			User: query.Querent(req.User),
			Plugin: query.Plugin{
				ID:         query.PluginID(req.Plugin.ID),
				Name:       query.PluginName(req.Plugin.Name),
				Owner:      query.PluginOwner(req.Plugin.Owner),
				Entrypoint: entrypoint,
			},
			Project: query.Project(req.Project),
			Targets: Targets,
			Args: query.Args{
				DetectorVersion: query.DetectorVersion(req.Args.DetectorVersion),
				Parameters:      query.Parameters(req.Args.Parameters),
			},
		}

		log.Printf("debug: received detect request: %+v", q)

		artifacts, err := r.Service.Detect.Exec(&q)

		if artifacts == nil {
			log.Printf("alert: an error occurred when processing detect query %+v: %s", q, err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		defer artifacts.Close()

		data, err := ioutil.ReadAll(artifacts)
		if err != nil {
			log.Printf("alert: failed to read all artifacts archive of detect query %+v: %+s", q, err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.Data(http.StatusOK, "application/x-tar", data)
	}
}

func detectHandler(router *gin.RouterGroup, r *types.Registry) {
	router.POST("", detectPostHandler(r))
}

// Detect is a route definition for POST /detect
var Detect = presentation.Route{
	Path:    "/detect",
	Handler: detectHandler,
}
