package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllUserAchievements(w http.ResponseWriter, r *http.Request) {
	userAchievements, err := repository.GetAllUserAchievements()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User achievements retrieved successfully",
		Data:    map[string]interface{}{"user_achievements": userAchievements},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func GetUserAchievementByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid user achievement ID"})
		return
	}

	userAchievement, err := repository.GetUserAchievementByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "User achievement not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User achievement retrieved successfully",
		Data:    map[string]interface{}{"user_achievement": userAchievement},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func CreateUserAchievement(w http.ResponseWriter, r *http.Request) {
	var userAchievement models.UserAchievement
	err := json.NewDecoder(r.Body).Decode(&userAchievement)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = repository.CreateUserAchievement(&userAchievement)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create user achievement"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User achievement created successfully",
		Data:    map[string]interface{}{"user_achievement": userAchievement},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func DeleteUserAchievement(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid user achievement ID"})
		return
	}

	err = repository.DeleteUserAchievement(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete user achievement"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User achievement deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}
