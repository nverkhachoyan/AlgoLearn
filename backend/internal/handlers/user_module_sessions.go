// internal/handlers/user_module_sessions.go
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

func GetAllUserModuleSessions(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	sessions, err := repository.GetUserModuleSessionsByUserID(userID)
	if err != nil {
		log.Printf("Error fetching user_module_sessions for user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve user_module_sessions"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User module sessions retrieved successfully", Data: sessions})
}

func GetUserModuleSessionByID(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	session, err := repository.GetUserModuleSessionByID(id, userID)
	if err != nil {
		log.Printf("Error fetching user_module_session %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve user_module_session"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User module session retrieved successfully", Data: session})
}

func CreateUserModuleSession(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	var session models.UserModuleSession
	if err := json.NewDecoder(r.Body).Decode(&session); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}
	session.UserID = userID

	if err := repository.CreateUserModuleSession(&session); err != nil {
		log.Printf("Error creating user_module_session for user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create user_module_session"})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{Status: "success", Message: "User module session created successfully", Data: session})
}

func UpdateUserModuleSession(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	var session models.UserModuleSession
	if err := json.NewDecoder(r.Body).Decode(&session); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	// Ensure the session being updated is the one authenticated
	if session.ID != id || session.UserID != userID {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Cannot update another user's session"})
		return
	}

	session.ID = id
	session.UserID = userID

	if err := repository.UpdateUserModuleSession(&session); err != nil {
		log.Printf("Error updating user_module_session %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not update user_module_session"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User module session updated successfully"})
}

func DeleteUserModuleSession(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	if err := repository.DeleteUserModuleSession(id, userID); err != nil {
		log.Printf("Error deleting user_module_session %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not delete user_module_session"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User module session deleted successfully"})
}
