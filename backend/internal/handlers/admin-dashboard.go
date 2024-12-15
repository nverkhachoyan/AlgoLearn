package handlers

import (
	"net/http"

	"algolearn/internal/models"
	"algolearn/pkg/middleware"

	"github.com/gin-gonic/gin"
)

type AdminDashboardHandler interface {
	AdminDashboard(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
}

type adminDashboardHandler struct{}

func NewAdminDashboardHandler() AdminDashboardHandler {
	return &adminDashboardHandler{}
}

func (h *adminDashboardHandler) AdminDashboard(c *gin.Context) {
	c.JSON(http.StatusOK, models.Response{Success: true, Message: "Admin dashboard"})
}

func (h *adminDashboardHandler) RegisterRoutes(r *gin.RouterGroup) {
	admin := r.Group("/admin", middleware.Auth())
	admin.GET("", h.AdminDashboard)
}
