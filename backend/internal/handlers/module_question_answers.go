// internal/handlers/module_question_answers.go
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

func GetAllModuleQuestionAnswers(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	questionID, err := strconv.Atoi(params["question_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid question ID"})
		return
	}

	answers, err := repository.GetAnswersByQuestionID(questionID)
	if err != nil {
		log.Printf("Error fetching answers for question %d: %v", questionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve answers"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Answers retrieved successfully", Data: answers})
}

func GetModuleQuestionAnswerByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid answer ID"})
		return
	}

	answer, err := repository.GetModuleQuestionAnswerByID(id)
	if err != nil {
		log.Printf("Error fetching answer %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve answer"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Answer retrieved successfully", Data: answer})
}

func CreateModuleQuestionAnswer(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can create answers
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	var answer models.ModuleQuestionAnswer
	if err := json.NewDecoder(r.Body).Decode(&answer); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	if err := repository.CreateModuleQuestionAnswer(&answer); err != nil {
		log.Printf("Error creating answer: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create answer"})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{Status: "success", Message: "Answer created successfully", Data: answer})
}

func UpdateModuleQuestionAnswer(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can update answers
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid answer ID"})
		return
	}

	var answer models.ModuleQuestionAnswer
	if err := json.NewDecoder(r.Body).Decode(&answer); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}
	answer.ID = id

	if err := repository.UpdateModuleQuestionAnswer(&answer); err != nil {
		log.Printf("Error updating answer %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not update answer"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Answer updated successfully"})
}

func DeleteModuleQuestionAnswer(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can delete answers
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid answer ID"})
		return
	}

	if err := repository.DeleteModuleQuestionAnswer(id); err != nil {
		log.Printf("Error deleting answer %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not delete answer"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Answer deleted successfully"})
}
