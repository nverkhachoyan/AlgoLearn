package handlers

import (
	"algolearn/internal/models"

	"algolearn/internal/service"
	"algolearn/pkg/middleware"

	"net/http"

	"github.com/gin-gonic/gin"
)

type NotificationsHandler interface {
	GetAllNotifications(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
}

type notificationsHandler struct {
	repo service.NotificationsService
}

func NewNotificationsHandler(repo service.NotificationsService) NotificationsHandler {
	return &notificationsHandler{repo: repo}
}

func (h *notificationsHandler) GetAllNotifications(c *gin.Context) {
	notifications, err := h.repo.GetAllNotifications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Internal server error"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Notifications retrieved successfully",
		Data:    map[string]interface{}{"notifications": notifications},
	}

	c.JSON(http.StatusOK, response)
}

func (h *notificationsHandler) RegisterRoutes(r *gin.RouterGroup) {
	authorized := r.Group("/notifications", middleware.Auth())
	authorized.GET("", h.GetAllNotifications)
}
