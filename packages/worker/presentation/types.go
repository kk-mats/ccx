package presentation

import (
	"github.com/gin-gonic/gin"
	"github.com/kk-mats/ccx-worker/types"
)

type Route struct {
	Path    string
	Handler func(router *gin.RouterGroup, r *types.Registry)
}
