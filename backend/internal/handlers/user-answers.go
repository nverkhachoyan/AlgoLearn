package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllUserAnswers(w http.ResponseWriter, r *http.Request) {
	userAnswers, err := repository.GetAllUserAnswers()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User answers retrieved successfully",
		Data:    map[string]interface{}{"user_answers": userAnswers},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func GetUserAnswerByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid user answer ID"})
		return
	}

	userAnswer, err := repository.GetUserAnswerByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "User answer not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User answer retrieved successfully",
		Data:    map[string]interface{}{"user_answer": userAnswer},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func CreateUserAnswer(w http.ResponseWriter, r *http.Request) {
	var userAnswer models.UserAnswer
	err := json.NewDecoder(r.Body).Decode(&userAnswer)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = repository.CreateUserAnswer(&userAnswer)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create user answer"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User answer created successfully",
		Data:    map[string]interface{}{"user_answer": userAnswer},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func UpdateUserAnswer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid user answer ID"})
		return
	}

	var userAnswer models.UserAnswer
	err = json.NewDecoder(r.Body).Decode(&userAnswer)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	userAnswer.ID = id
	err = repository.UpdateUserAnswer(&userAnswer)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to update user answer"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User answer updated successfully",
		Data:    map[string]interface{}{"user_answer": userAnswer},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func DeleteUserAnswer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid user answer ID"})
		return
	}

	err = repository.DeleteUserAnswer(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete user answer"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User answer deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}
