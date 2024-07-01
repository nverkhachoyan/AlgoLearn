package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllAnswers(w http.ResponseWriter, r *http.Request) {
	answers, err := repository.GetAllAnswers()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Answers retrieved successfully",
		Data:    map[string]interface{}{"answers": answers},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func GetAnswerByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid answer ID"})
		return
	}

	answer, err := repository.GetAnswerByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "Answer not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Answer retrieved successfully",
		Data:    map[string]interface{}{"answer": answer},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func CreateAnswer(w http.ResponseWriter, r *http.Request) {
	var answer models.Answer
	err := json.NewDecoder(r.Body).Decode(&answer)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = repository.CreateAnswer(&answer)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create answer"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Answer created successfully",
		Data:    map[string]interface{}{"answer": answer},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func UpdateAnswer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid answer ID"})
		return
	}

	var answer models.Answer
	err = json.NewDecoder(r.Body).Decode(&answer)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	answer.ID = id
	err = repository.UpdateAnswer(&answer)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to update answer"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Answer updated successfully",
		Data:    map[string]interface{}{"answer": answer},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func DeleteAnswer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid answer ID"})
		return
	}

	err = repository.DeleteAnswer(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete answer"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Answer deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}
