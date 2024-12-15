package router

import (
	"github.com/gin-gonic/gin"
)

type RouteRegistrar interface {
	RegisterRoutes(r *gin.RouterGroup)
}

// RegisterRoutes registers all routes from the provided handlers
func RegisterRoutes(r *gin.Engine, registrars ...RouteRegistrar) {
	// API version group
	v1 := r.Group("/api/v1")

	// Health check endpoint (outside versioning)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Register all routes under /api/v1
	for _, registrar := range registrars {
		registrar.RegisterRoutes(v1)
	}
}
