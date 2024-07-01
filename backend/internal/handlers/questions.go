package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllQuestions(w http.ResponseWriter, r *http.Request) {
	questions, err := repository.GetAllQuestions()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Questions retrieved successfully",
		Data:    map[string]interface{}{"questions": questions},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func GetQuestionByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid question ID"})
		return
	}

	question, err := repository.GetQuestionByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "Question not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Question retrieved successfully",
		Data:    map[string]interface{}{"question": question},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func CreateQuestion(w http.ResponseWriter, r *http.Request) {
	var question models.Question
	err := json.NewDecoder(r.Body).Decode(&question)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = repository.CreateQuestion(&question)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create question"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Question created successfully",
		Data:    map[string]interface{}{"question": question},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func UpdateQuestion(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid question ID"})
		return
	}

	var question models.Question
	err = json.NewDecoder(r.Body).Decode(&question)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	question.ID = id
	err = repository.UpdateQuestion(&question)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to update question"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Question updated successfully",
		Data:    map[string]interface{}{"question": question},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid question ID"})
		return
	}

	err = repository.DeleteQuestion(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete question"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Question deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}
