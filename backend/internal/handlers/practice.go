package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllPracticeSessions(w http.ResponseWriter, r *http.Request) {
	sessions, err := repository.GetAllPracticeSessions()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Practice sessions retrieved successfully",
		Data:    map[string]interface{}{"practice_sessions": sessions},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func GetPracticeSessionByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	session, err := repository.GetPracticeSessionByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "Practice session not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Practice session retrieved successfully",
		Data:    map[string]interface{}{"practice_session": session},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func CreatePracticeSession(w http.ResponseWriter, r *http.Request) {
	var session models.PracticeSession
	err := json.NewDecoder(r.Body).Decode(&session)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = repository.CreatePracticeSession(&session)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create practice session"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Practice session created successfully",
		Data:    map[string]interface{}{"practice_session": session},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func UpdatePracticeSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	var session models.PracticeSession
	err = json.NewDecoder(r.Body).Decode(&session)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	session.ID = id
	err = repository.UpdatePracticeSession(&session)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to update practice session"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Practice session updated successfully",
		Data:    map[string]interface{}{"practice_session": session},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func DeletePracticeSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	err = repository.DeletePracticeSession(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete practice session"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Practice session deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}
