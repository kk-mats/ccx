package worker

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/kk-mats/ccx-worker/middleware"
	"github.com/kk-mats/ccx-worker/presentation/worker/route"
	"github.com/kk-mats/ccx-worker/types"
)

func NewWorkerServer(port uint, r *types.Registry) error {
	router := gin.New()

	router.Use(gin.LoggerWithFormatter(middleware.Formatter))
	router.Use(gin.Recovery())

	detectRouter := router.Group(route.Detect.Path)
	{
		route.Detect.Handler(detectRouter, r)
	}

	rootRouter := router.Group(route.Root.Path)
	{
		route.Root.Handler(rootRouter, r)
	}

	return router.Run(fmt.Sprintf("0.0.0.0:%d", port))
}
