package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllTopics(w http.ResponseWriter, r *http.Request) {
	topics, err := repository.GetAllTopics()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Topics retrieved successfully",
		Data:    map[string]interface{}{"topics": topics},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func GetTopicByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid topic ID"})
		return
	}

	topic, err := repository.GetTopicByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "Topic not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Topic retrieved successfully",
		Data:    map[string]interface{}{"topic": topic},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func CreateTopic(w http.ResponseWriter, r *http.Request) {
	var topic models.Topic
	err := json.NewDecoder(r.Body).Decode(&topic)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = repository.CreateTopic(&topic)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create topic"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Topic created successfully",
		Data:    map[string]interface{}{"topic": topic},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func UpdateTopic(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid topic ID"})
		return
	}

	var topic models.Topic
	err = json.NewDecoder(r.Body).Decode(&topic)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	topic.ID = id
	err = repository.UpdateTopic(&topic)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to update topic"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Topic updated successfully",
		Data:    map[string]interface{}{"topic": topic},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func DeleteTopic(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid topic ID"})
		return
	}

	err = repository.DeleteTopic(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete topic"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Topic deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}
