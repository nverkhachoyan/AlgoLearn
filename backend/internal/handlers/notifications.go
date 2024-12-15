package handlers

import (
	"algolearn/internal/models"
	"algolearn/internal/router"

	"algolearn/internal/repository"
	"algolearn/pkg/middleware"

	"net/http"
)

type NotificationsHandler interface {
	GetAllNotifications(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
}

type notificationsHandler struct {
	repo repository.NotificationsRepository
}

func NewNotificationsHandler(repo repository.NotificationsRepository) NotificationsHandler {
	return &notificationsHandler{repo: repo}
}

func (h *notificationsHandler) GetAllNotifications(w http.ResponseWriter, _ *http.Request) {
	notifications, err := h.repo.GetAllNotifications()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Success: false, Message: "Internal server error"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Notifications retrieved successfully",
		Data:    map[string]interface{}{"notifications": notifications},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func (h *notificationsHandler) RegisterRoutes(r *router.Router) {
	authorized := r.Group("/notifications", middleware.Auth)
	authorized.Handle("", h.GetAllNotifications, "GET")
}
