package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"net/http"
)

func GetAllTopics(w http.ResponseWriter, r *http.Request) {
	topics, err := repository.GetAllTopics()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Topics retrieved successfully",
		Data:    map[string]interface{}{"topics": topics},
	}

	RespondWithJSON(w, http.StatusOK, response)
}