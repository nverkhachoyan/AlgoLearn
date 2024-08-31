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

func GetAllStreaks(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	streaks, err := repository.GetStreaksByUserID(userID)
	if err != nil {
		log.Printf("Error fetching streaks for user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve streaks"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Streaks retrieved successfully", Data: streaks})
}

func GetStreakByID(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid streak ID"})
		return
	}

	streak, err := repository.GetStreakByID(id, userID)
	if err != nil {
		log.Printf("Error fetching streak %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve streak"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Streak retrieved successfully", Data: streak})
}

func CreateStreak(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	var streak models.Streak
	if err := json.NewDecoder(r.Body).Decode(&streak); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}
	streak.UserID = userID

	if err := repository.CreateStreak(&streak); err != nil {
		log.Printf("Error creating streak for user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create streak"})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{Status: "success", Message: "Streak created successfully", Data: streak})
}

func UpdateStreak(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid streak ID"})
		return
	}

	var streak models.Streak
	if err := json.NewDecoder(r.Body).Decode(&streak); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}
	streak.ID = id
	streak.UserID = userID

	if err := repository.UpdateStreak(&streak); err != nil {
		log.Printf("Error updating streak %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not update streak"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Streak updated successfully"})
}

func DeleteStreak(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid streak ID"})
		return
	}

	if err := repository.DeleteStreak(id, userID); err != nil {
		log.Printf("Error deleting streak %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not delete streak"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Streak deleted successfully"})
}
