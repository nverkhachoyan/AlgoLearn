package handlers

import (
	httperr "algolearn/internal/errors"
	"algolearn/internal/models"

	"algolearn/internal/service"
	"algolearn/pkg/logger"
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
	log  *logger.Logger
}

func NewNotificationsHandler(repo service.NotificationsService) NotificationsHandler {
	return &notificationsHandler{repo: repo, log: logger.Get()}
}

func (h *notificationsHandler) GetAllNotifications(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetAllNotifications")
	notifications, err := h.repo.GetAllNotifications()
	if err != nil {
		log.WithError(err).Error("failed to get all notifications")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				Message:   "Internal server error",
				ErrorCode: httperr.InternalError,
			})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Notifications retrieved successfully",
		Payload: map[string]interface{}{"notifications": notifications},
	}

	c.JSON(http.StatusOK, response)
}

func (h *notificationsHandler) RegisterRoutes(r *gin.RouterGroup) {
	authorized := r.Group("/notifications", middleware.Auth())
	authorized.GET("", h.GetAllNotifications)
}
