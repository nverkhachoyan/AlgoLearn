package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"net/http"
)

type NotificationsHandler interface {
	GetAllNotifications(w http.ResponseWriter, r *http.Request)
}

type notificationsHandler struct {
	repo repository.NotificationsRepository
}

func NewNotificationsHandler(repo repository.NotificationsRepository) NotificationsHandler {
	return &notificationsHandler{repo: repo}
}

func (h *notificationsHandler) GetAllNotifications(w http.ResponseWriter, r *http.Request) {
	notifications, err := h.repo.GetAllNotifications()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Notifications retrieved successfully",
		Data:    map[string]interface{}{"notifications": notifications},
	}

	RespondWithJSON(w, http.StatusOK, response)
}
