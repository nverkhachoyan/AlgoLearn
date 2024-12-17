package handlers

import (
	"algolearn/internal/models"
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"

	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AchievementsHandler interface {
	GetAllAchievements(c *gin.Context)
	GetAchievementByID(c *gin.Context)
	CreateAchievement(c *gin.Context)
	UpdateAchievement(c *gin.Context)
	DeleteAchievement(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
}

type achievementsHandler struct {
	repo service.AchievementsService
	log  *logger.Logger
}

func NewAchievementsHandler(repo service.AchievementsService) AchievementsHandler {
	return &achievementsHandler{repo: repo, log: logger.Get()}
}

func (h *achievementsHandler) GetAllAchievements(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetAllAchievements")
	achievements, err := h.repo.GetAllAchievements()
	if err != nil {
		log.WithError(err).Error("failed to get all achievements")
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "internal server error"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Achievements retrieved successfully",
		Payload: map[string]interface{}{"achievements": achievements},
	}

	c.JSON(http.StatusOK, response)
}

func (h *achievementsHandler) GetAchievementByID(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetAchievementByID")
	idStr := c.Param("id")

	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		log.WithError(err).Error("invalid achievement ID")
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "Invalid achievement ID"})
		return
	}

	achievement, err := h.repo.GetAchievementByID(int32(id))
	if err != nil {
		log.WithError(err).Error("failed to get achievement by ID")
		c.JSON(http.StatusNotFound, models.Response{Success: false, Message: "Achievement not found"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Achievement retrieved successfully",
		Payload: map[string]interface{}{"achievement": achievement},
	}

	c.JSON(http.StatusOK, response)
}

func (h *achievementsHandler) CreateAchievement(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "CreateAchievement")
	var achievement models.Achievement
	err := json.NewDecoder(c.Request.Body).Decode(&achievement)
	if err != nil {
		log.WithError(err).Error("invalid request payload")
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "Invalid request payload"})
		return
	}

	err = h.repo.CreateAchievement(&achievement)
	if err != nil {
		log.WithError(err).Error("failed to create achievement")
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to create achievement"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Achievement created successfully",
		Payload: map[string]interface{}{"achievement": achievement},
	}

	c.JSON(http.StatusCreated, response)
}

func (h *achievementsHandler) UpdateAchievement(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "UpdateAchievement")
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		log.WithError(err).Error("invalid achievement ID")
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "Invalid achievement ID"})
		return
	}

	var achievement models.Achievement
	err = json.NewDecoder(c.Request.Body).Decode(&achievement)
	if err != nil {
		log.WithError(err).Error("invalid request payload")
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "invalid request payload"})
		return
	}

	achievement.ID = int32(id)
	err = h.repo.UpdateAchievement(&achievement)
	if err != nil {
		log.WithError(err).Error("failed to update achievement")
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "failed to update achievement"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "achievement updated successfully",
		Payload: map[string]interface{}{"achievement": achievement},
	}

	c.JSON(http.StatusOK, response)
}

func (h *achievementsHandler) DeleteAchievement(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "DeleteAchievement")
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		log.WithError(err).Error("invalid achievement ID")
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "invalid achievement ID"})
		return
	}

	err = h.repo.DeleteAchievement(int32(id))
	if err != nil {
		log.WithError(err).Error("failed to delete achievement")
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "failed to delete achievement"})
		return
	}

	response := models.Response{
		Success: true,
		Message: "achievement deleted successfully",
	}

	c.JSON(http.StatusOK, response)
}

func (h *achievementsHandler) RegisterRoutes(r *gin.RouterGroup) {
	public := r.Group("/achievements")
	authorized := r.Group("/achievements", middleware.Auth())

	public.GET("", h.GetAllAchievements)
	public.GET("/:id", h.GetAchievementByID)

	authorized.POST("", h.CreateAchievement)
	authorized.PUT("/:id", h.UpdateAchievement)
	authorized.DELETE("/:id", h.DeleteAchievement)
}
