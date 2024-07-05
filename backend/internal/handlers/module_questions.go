// internal/handlers/module_questions.go
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

// GetAllModuleQuestions handles fetching all questions for a module
func GetAllModuleQuestions(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	moduleID, err := strconv.Atoi(params["module_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid module ID"})
		return
	}

	questions, err := repository.GetQuestionsByModuleID(moduleID)
	if err != nil {
		log.Printf("Error fetching questions for module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve questions"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Questions retrieved successfully", Data: questions})
}

// GetModuleQuestionByID handles fetching a question by ID
func GetModuleQuestionByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid question ID"})
		return
	}

	question, err := repository.GetQuestionByID(id)
	if err != nil {
		log.Printf("Error fetching question %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve question"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Question retrieved successfully", Data: question})
}

// CreateModuleQuestion handles creating a new question for a module
func CreateModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can create questions
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	var question models.ModuleQuestion
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	if err := repository.CreateQuestion(&question); err != nil {
		log.Printf("Error creating question: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create question"})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{Status: "success", Message: "Question created successfully", Data: question})
}

// UpdateModuleQuestion handles updating a question
func UpdateModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can update questions
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid question ID"})
		return
	}

	var question models.ModuleQuestion
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}
	question.ID = id

	if err := repository.UpdateQuestion(&question); err != nil {
		log.Printf("Error updating question %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not update question"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Question updated successfully"})
}

// DeleteModuleQuestion handles deleting a question
func DeleteModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can delete questions
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid question ID"})
		return
	}

	if err := repository.DeleteQuestion(id); err != nil {
		log.Printf("Error deleting question %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not delete question"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Question deleted successfully"})
}
