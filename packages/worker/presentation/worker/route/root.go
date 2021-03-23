package route

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/v5"
	"github.com/kk-mats/ccx-worker/domain/object/value"
	"github.com/kk-mats/ccx-worker/presentation"

	"github.com/kk-mats/ccx-worker/types"
)

func rootPostHandler(r *types.Registry) gin.HandlerFunc {
	return func(c *gin.Context) {
		var p value.PrimeConfig
		err := c.ShouldBindJSON(&p)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			log.Fatalf("alert: Received invalid config from controller: %s", err.Error())
			return
		}

		if p != r.GlobalConfig.Prime {
			log.Printf("error: Received configuration from other controller: %v", p)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Restart "})
			return
		}

		log.Printf("info: Received configuration from the same controller")
		c.JSON(http.StatusOK, gin.H{"type": *r.GlobalConfig.Worker.WorkerType})
		if err = r.Repository.PluginFileSystem.SyncAll(); err != nil {
			switch err {
			case git.NoErrAlreadyUpToDate:
				{
					break
				}
			default:
				{
					log.Printf("warn: Failed to sync plugins: %s", err.Error())
				}
			}
		}
	}
}

func rootHandler(router *gin.RouterGroup, r *types.Registry) {
	router.POST("/", rootPostHandler(r))
}

// Root is a route definition for POST /
var Root = presentation.Route{
	Path:    "/",
	Handler: rootHandler,
}
