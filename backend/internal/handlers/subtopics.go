package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllSubtopics(w http.ResponseWriter, r *http.Request) {
	subtopics, err := repository.GetAllSubtopics()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Subtopics retrieved successfully",
		Data:    map[string]interface{}{"subtopics": subtopics},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func GetSubtopicByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid subtopic ID"})
		return
	}

	subtopic, err := repository.GetSubtopicByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "Subtopic not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Subtopic retrieved successfully",
		Data:    map[string]interface{}{"subtopic": subtopic},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func CreateSubtopic(w http.ResponseWriter, r *http.Request) {
	var subtopic models.Subtopic
	err := json.NewDecoder(r.Body).Decode(&subtopic)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = repository.CreateSubtopic(&subtopic)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create subtopic"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Subtopic created successfully",
		Data:    map[string]interface{}{"subtopic": subtopic},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func UpdateSubtopic(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid subtopic ID"})
		return
	}

	var subtopic models.Subtopic
	err = json.NewDecoder(r.Body).Decode(&subtopic)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	subtopic.ID = id
	err = repository.UpdateSubtopic(&subtopic)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to update subtopic"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Subtopic updated successfully",
		Data:    map[string]interface{}{"subtopic": subtopic},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func DeleteSubtopic(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid subtopic ID"})
		return
	}

	err = repository.DeleteSubtopic(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete subtopic"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Subtopic deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}
