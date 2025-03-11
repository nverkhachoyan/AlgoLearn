package router

import (
	"github.com/gin-gonic/gin"
)

type RouteRegistrar interface {
	RegisterRoutes(r *gin.RouterGroup)
}

type RootRouteRegistrar interface {
	RegisterRootRoutes(r *gin.Engine)
}

func RegisterRoutes(r *gin.Engine, registrars ...RouteRegistrar) {
	v1 := r.Group("/api/v1")

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	for _, registrar := range registrars {
		if rootRegistrar, ok := registrar.(RootRouteRegistrar); ok {
			rootRegistrar.RegisterRootRoutes(r)
		}
		registrar.RegisterRoutes(v1)
	}
}
