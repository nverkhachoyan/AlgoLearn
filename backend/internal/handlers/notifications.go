package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllNotifications(w http.ResponseWriter, r *http.Request) {
	notifications, err := repository.GetAllNotifications()
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

func GetNotificationByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid notification ID"})
		return
	}

	notification, err := repository.GetNotificationByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "Notification not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Notification retrieved successfully",
		Data:    map[string]interface{}{"notification": notification},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func CreateNotification(w http.ResponseWriter, r *http.Request) {
	var notification models.Notification
	err := json.NewDecoder(r.Body).Decode(&notification)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = repository.CreateNotification(&notification)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create notification"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Notification created successfully",
		Data:    map[string]interface{}{"notification": notification},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func UpdateNotification(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid notification ID"})
		return
	}

	var notification models.Notification
	err = json.NewDecoder(r.Body).Decode(&notification)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	notification.ID = id
	err = repository.UpdateNotification(&notification)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to update notification"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Notification updated successfully",
		Data:    map[string]interface{}{"notification": notification},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func DeleteNotification(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid notification ID"})
		return
	}

	err = repository.DeleteNotification(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete notification"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Notification deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}
