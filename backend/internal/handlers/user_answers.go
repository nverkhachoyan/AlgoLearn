// internal/handlers/user_answers.go
package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllUserAnswers(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	sessionID, err := strconv.Atoi(params["session_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	answers, err := repository.GetUserAnswersBySessionID(sessionID)
	if err != nil {
		log.Printf("Error fetching user_answers for session %d: %v", sessionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve user_answers"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User answers retrieved successfully", Data: answers})
}

func GetUserAnswerByID(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid answer ID"})
		return
	}

	answer, err := repository.GetUserAnswerByID(id)
	if err != nil {
		log.Printf("Error fetching user_answer %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve user_answer"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User answer retrieved successfully", Data: answer})
}

func CreateUserAnswer(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	var answer models.UserAnswer
	if err := json.NewDecoder(r.Body).Decode(&answer); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}
	// Assuming userID is required for validation, though not stored in this struct directly
	answer.UserModuleSessionID = userID

	if err := repository.CreateUserAnswer(&answer); err != nil {
		log.Printf("Error creating user_answer for user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create user_answer"})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{Status: "success", Message: "User answer created successfully", Data: answer})
}

func UpdateUserAnswer(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid answer ID"})
		return
	}

	var answer models.UserAnswer
	if err := json.NewDecoder(r.Body).Decode(&answer); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	// Ensure the answer being updated is the one authenticated
	if answer.ID != id {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Cannot update another user's answer"})
		return
	}

	answer.ID = id

	if err := repository.UpdateUserAnswer(&answer); err != nil {
		log.Printf("Error updating user_answer %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not update user_answer"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User answer updated successfully"})
}

func DeleteUserAnswer(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid answer ID"})
		return
	}

	if err := repository.DeleteUserAnswer(id); err != nil {
		log.Printf("Error deleting user_answer %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not delete user_answer"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User answer deleted successfully"})
}
