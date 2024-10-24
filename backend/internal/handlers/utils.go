package handlers

import (
	"algolearn/internal/models"
	"encoding/json"
	"net/http"
)

// RespondWithJSON sends a JSON response with a given status
func RespondWithJSON(w http.ResponseWriter, status int, response models.Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}
