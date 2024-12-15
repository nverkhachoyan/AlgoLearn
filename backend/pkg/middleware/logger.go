package middleware

import (
	"algolearn/pkg/logger"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger returns a gin.HandlerFunc (middleware) that logs requests using logrus
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		start := time.Now()

		// Process request
		c.Next()

		// Get request path and method
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery
		if raw != "" {
			path = path + "?" + raw
		}

		// Get response status
		statusCode := c.Writer.Status()

		// Log request details
		log := logger.Get().WithFields(logger.Fields{
			"status":     statusCode,
			"method":     c.Request.Method,
			"path":       path,
			"ip":         c.ClientIP(),
			"latency":    time.Since(start),
			"user-agent": c.Request.UserAgent(),
		})

		if len(c.Errors) > 0 {
			// Append error field if this is an erroneous request
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
