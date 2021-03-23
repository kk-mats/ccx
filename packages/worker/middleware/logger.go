package middleware

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func Formatter(param gin.LogFormatterParams) string {
	return fmt.Sprintf("debug: %v | %3d | %13v | %15s | %-7s %#v\n%s",
		param.TimeStamp.Format("2006/01/02 - 15:04:05"),
		param.StatusCode,
		param.Latency,
		param.ClientIP,
		param.Method,
		param.Path,
		param.ErrorMessage,
	)
}
