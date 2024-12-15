package handlers

import (
	"algolearn/internal/models"
	"algolearn/internal/repository"
	"algolearn/internal/router"
	"algolearn/pkg/middleware"

	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type AchievementsHandler interface {
	GetAllAchievements(w http.ResponseWriter, r *http.Request)
	GetAchievementByID(w http.ResponseWriter, r *http.Request)
	CreateAchievement(w http.ResponseWriter, r *http.Request)
	UpdateAchievement(w http.ResponseWriter, r *http.Request)
	DeleteAchievement(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
}

type achievementsHandler struct {
	repo repository.AchievementsRepository
}

func NewAchievementsHandler(repo repository.AchievementsRepository) AchievementsHandler {
	return &achievementsHandler{repo: repo}
}

func (h *achievementsHandler) GetAllAchievements(w http.ResponseWriter, _ *http.Request) {
	achievements, err := h.repo.GetAllAchievements()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Success: false, Message: "internal server error"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Achievements retrieved successfully",
		Data:    map[string]interface{}{"achievements": achievements},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func (h *achievementsHandler) GetAchievementByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Success: false, Message: "Invalid achievement ID"})
		return
	}

	achievement, err := h.repo.GetAchievementByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Success: false, Message: "Achievement not found"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Achievement retrieved successfully",
		Data:    map[string]interface{}{"achievement": achievement},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func (h *achievementsHandler) CreateAchievement(w http.ResponseWriter, r *http.Request) {
	var achievement models.Achievement
	err := json.NewDecoder(r.Body).Decode(&achievement)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Success: false, Message: "Invalid request payload"})
		return
	}

	err = h.repo.CreateAchievement(&achievement)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to create achievement"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Achievement created successfully",
		Data:    map[string]interface{}{"achievement": achievement},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func (h *achievementsHandler) UpdateAchievement(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Success: false, Message: "Invalid achievement ID"})
		return
	}

	var achievement models.Achievement
	err = json.NewDecoder(r.Body).Decode(&achievement)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Success: false, Message: "invalid request payload"})
		return
	}

	achievement.ID = id
	err = h.repo.UpdateAchievement(&achievement)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Success: false, Message: "failed to update achievement"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "achievement updated successfully",
		Data:    map[string]interface{}{"achievement": achievement},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func (h *achievementsHandler) DeleteAchievement(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Success: false, Message: "invalid achievement ID"})
		return
	}

	err = h.repo.DeleteAchievement(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Success: false, Message: "failed to delete achievement"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "achievement deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func (h *achievementsHandler) RegisterRoutes(r *router.Router) {
	public := r.Group("/achievements")
	authorized := r.Group("/achievements", middleware.Auth)

	public.Handle("", h.GetAllAchievements, "GET")
	public.Handle("/{id}", h.GetAchievementByID, "GET")

	authorized.Handle("", h.CreateAchievement, "POST")
	authorized.Handle("/{id}", h.UpdateAchievement, "PUT")
	authorized.Handle("/{id}", h.DeleteAchievement, "DELETE")
}
