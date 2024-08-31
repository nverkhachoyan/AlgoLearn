package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllAchievements(w http.ResponseWriter, r *http.Request) {
	achievements, err := repository.GetAllAchievements()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Achievements retrieved successfully",
		Data:    map[string]interface{}{"achievements": achievements},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func GetAchievementByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid achievement ID"})
		return
	}

	achievement, err := repository.GetAchievementByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "Achievement not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Achievement retrieved successfully",
		Data:    map[string]interface{}{"achievement": achievement},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func CreateAchievement(w http.ResponseWriter, r *http.Request) {
	var achievement models.Achievement
	err := json.NewDecoder(r.Body).Decode(&achievement)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = repository.CreateAchievement(&achievement)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create achievement"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Achievement created successfully",
		Data:    map[string]interface{}{"achievement": achievement},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func UpdateAchievement(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid achievement ID"})
		return
	}

	var achievement models.Achievement
	err = json.NewDecoder(r.Body).Decode(&achievement)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	achievement.ID = id
	err = repository.UpdateAchievement(&achievement)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to update achievement"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Achievement updated successfully",
		Data:    map[string]interface{}{"achievement": achievement},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func DeleteAchievement(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid achievement ID"})
		return
	}

	err = repository.DeleteAchievement(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete achievement"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Achievement deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}
