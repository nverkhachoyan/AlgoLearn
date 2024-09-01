package handlers

import (
	"algolearn-backend/internal/models"
	"net/http"
)

func Welcome(w http.ResponseWriter, r *http.Request) {
	response := models.Response{Status: "success", Message: "Welcome to AlgoLearn API"}
	RespondWithJSON(w, http.StatusOK, response)
}

// Health check endpoint
func Health(w http.ResponseWriter, r *http.Request) {
	response := models.Response{Status: "success", Message: "Healthy"}
	RespondWithJSON(w, http.StatusOK, response)
}
