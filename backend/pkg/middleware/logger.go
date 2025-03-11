package middleware

import (
	"algolearn/pkg/logger"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery
		if raw != "" {
			path = path + "?" + raw
		}

		statusCode := c.Writer.Status()

		log := logger.Get().WithFields(logger.Fields{
			"status":     statusCode,
			"method":     c.Request.Method,
			"path":       path,
			"ip":         c.ClientIP(),
			"latency":    time.Since(start),
			"user-agent": c.Request.UserAgent(),
		})

		if len(c.Errors) > 0 {
			log.Error(c.Errors.String())
		} else {
			if statusCode >= 500 {
				log.Error("Server error")
			} else if statusCode >= 400 {
				log.Warn("Client error")
			} else {
				log.Info("Request processed")
			}
		}
	}
}
