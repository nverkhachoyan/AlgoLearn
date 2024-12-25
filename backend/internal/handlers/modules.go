package handlers

import (
	httperr "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ModuleHandler interface {
	GetModulesByUnitID(c *gin.Context)
	CreateModule(c *gin.Context)
	UpdateModule(c *gin.Context)
	DeleteModule(c *gin.Context)
	GetModuleWithProgress(c *gin.Context)
	UpdateModuleProgress(c *gin.Context)
	GetModules(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
}

type moduleHandler struct {
	moduleRepo service.ModuleService
	userRepo   service.UserService
	log        *logger.Logger
}

func NewModuleHandler(moduleRepo service.ModuleService,
	userRepo service.UserService) ModuleHandler {
	return &moduleHandler{
		moduleRepo: moduleRepo,
		userRepo:   userRepo,
		log:        logger.Get(),
	}
}

func (h *moduleHandler) GetModulesByUnitID(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetModulesByUnitID")
	ctx := c.Request.Context()

	unitID, err := strconv.ParseInt(c.Param("unitId"), 10, 64)
	if err != nil || unitID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit ID: must be a positive integer",
		})
		return
	}

	modules, err := h.moduleRepo.GetModulesByUnitID(ctx, unitID)
	if err != nil {
		log.WithError(err).Error("error fetching modules by unit id")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving modules",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "modules retrieved successfully",
		Payload: modules,
	})
}

func (h *moduleHandler) GetModuleWithProgress(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetModuleWithProgress")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to access module progress",
		})
		return
	}

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil || courseID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course ID: must be a positive integer",
		})
		return
	}

	unitID, err := strconv.ParseInt(c.Param("unitId"), 10, 64)
	if err != nil || unitID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit ID: must be a positive integer",
		})
		return
	}

	moduleID, err := strconv.ParseInt(c.Param("moduleId"), 10, 64)
	if err != nil || moduleID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid module ID: must be a positive integer",
		})
		return
	}

	moduleResponse, err := h.moduleRepo.GetModuleWithProgress(ctx, int64(userID), int64(courseID), unitID, moduleID)
	if err != nil {
		if errors.Is(err, httperr.ErrNotFound) {
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "module not found",
			})
			return
		}
		log.WithError(err).Error("error fetching module")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving module",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "module progress retrieved successfully",
		Payload: moduleResponse,
	})
}

func (h *moduleHandler) CreateModule(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "CreateModule")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to create a module",
		})
		return
	}

	unitID, err := strconv.ParseInt(c.Param("unitId"), 10, 64)
	if err != nil || unitID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit ID: must be a positive integer",
		})
		return
	}

	user, err := h.userRepo.GetUserByID(ctx, int32(userID))
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			ErrorCode: httperr.Forbidden,
			Message:   "only administrators can create modules",
		})
		return
	}

	var moduleRequest struct {
		Name        string           `json:"name"`
		Description string           `json:"description"`
		Sections    []models.Section `json:"sections"`
	}

	if err := json.NewDecoder(c.Request.Body).Decode(&moduleRequest); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidJson,
			Message:   "invalid request body: " + err.Error(),
		})
		return
	}

	if len(moduleRequest.Sections) > 0 {
		positions := make(map[int16]bool)
		for _, section := range moduleRequest.Sections {
			if section.Position < 0 {
				c.JSON(http.StatusBadRequest, models.Response{
					Success:   false,
					ErrorCode: httperr.InvalidFormData,
					Message:   "section position must be positive",
				})
				return
			}

			if positions[section.Position] {
				c.JSON(http.StatusBadRequest, models.Response{
					Success:   false,
					ErrorCode: httperr.InvalidFormData,
					Message:   "duplicate section position",
				})
				return
			}
			positions[section.Position] = true
		}

		createdModule, err := h.moduleRepo.CreateModuleWithContent(ctx, unitID, moduleRequest.Name, moduleRequest.Description, moduleRequest.Sections)
		if err != nil {
			log.WithError(err).Error("error creating module with content")
			c.JSON(http.StatusInternalServerError, models.Response{
				Success:   false,
				ErrorCode: httperr.DatabaseFail,
				Message:   "internal server error while creating module",
			})
			return
		}

		c.JSON(http.StatusCreated, models.Response{
			Success: true,
			Message: "module created successfully",
			Payload: createdModule,
		})
		return
	}

	// Create module without sections
	createdModule, err := h.moduleRepo.CreateModule(ctx, unitID, moduleRequest.Name, moduleRequest.Description)
	if err != nil {
		log.WithError(err).Error("error creating module")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while creating module",
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "module created successfully",
		Payload: createdModule,
	})
}

func (h *moduleHandler) UpdateModule(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "UpdateModule")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to update a module",
		})
		return
	}

	user, err := h.userRepo.GetUserByID(ctx, int32(userID))
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			ErrorCode: httperr.Forbidden,
			Message:   "only administrators can update modules",
		})
		return
	}

	moduleID, err := strconv.ParseInt(c.Param("moduleId"), 10, 64)
	if err != nil || moduleID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid module ID: must be a positive integer",
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(c.Request.Body).Decode(&module); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidJson,
			Message:   "invalid request body: " + err.Error(),
		})
		return
	}

	updatedModule, err := h.moduleRepo.UpdateModule(ctx, moduleID, module.Name, module.Description)
	if err != nil {
		if errors.Is(err, httperr.ErrNotFound) {
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "module not found",
			})
			return
		}
		log.WithError(err).Error("error updating module")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while updating module",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "module updated successfully",
		Payload: updatedModule,
	})
}

func (h *moduleHandler) DeleteModule(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "DeleteModule")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to delete a module",
		})
		return
	}

	user, err := h.userRepo.GetUserByID(ctx, int32(userID))
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			ErrorCode: httperr.Forbidden,
			Message:   "only administrators can delete modules",
		})
		return
	}

	moduleID, err := strconv.ParseInt(c.Param("moduleId"), 10, 64)
	if err != nil || moduleID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid module ID: must be a positive integer",
		})
		return
	}

	err = h.moduleRepo.DeleteModule(ctx, moduleID)
	if err != nil {
		if errors.Is(err, httperr.ErrNotFound) {
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "module not found",
			})
			return
		}
		log.WithError(err).Error("error deleting module")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while deleting module",
		})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (h *moduleHandler) UpdateModuleProgress(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "UpdateModuleProgress")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to update module progress",
		})
		return
	}

	moduleID, err := strconv.ParseInt(c.Param("moduleId"), 10, 64)
	if err != nil || moduleID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid module ID: must be a positive integer",
		})
		return
	}

	var batch models.BatchModuleProgress
	if err := json.NewDecoder(c.Request.Body).Decode(&batch); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidJson,
			Message:   "invalid request body: " + err.Error(),
		})
		return
	}

	err = h.moduleRepo.SaveModuleProgress(ctx, int64(userID), moduleID, batch.Sections, batch.Questions)
	if err != nil {
		if errors.Is(err, httperr.ErrNotFound) {
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "module not found",
			})
			return
		}
		log.WithError(err).Error("error updating module progress")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while updating module progress",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "module progress updated successfully",
	})
}

func (h *moduleHandler) GetModules(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetModules")
	ctx := c.Request.Context()

	unitID, err := strconv.ParseInt(c.Param("unitId"), 10, 64)
	if err != nil || unitID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit ID: must be a positive integer",
		})
		return
	}

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to list modules",
		})
		return
	}

	page, err := strconv.ParseInt(c.Query("currentPage"), 10, 64)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid page number: must be a positive integer",
		})
		return
	}

	pageSize, err := strconv.ParseInt(c.Query("pageSize"), 10, 64)
	if err != nil || pageSize < 1 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid page size: must be a positive integer",
		})
		return
	}

	modules, err := h.moduleRepo.GetModulesWithProgress(ctx, int64(userID), unitID, int(page), int(pageSize))
	if err != nil {
		log.WithError(err).Error("error fetching modules")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving modules",
		})
		return
	}

	totalCount, err := h.moduleRepo.GetModuleTotalCount(ctx, unitID)
	if err != nil {
		log.WithError(err).Error("error fetching total count")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving total count",
		})
		return
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "modules retrieved successfully",
		Payload: models.PaginatedPayload{
			Items: modules,
			Pagination: models.Pagination{
				TotalItems:  totalCount,
				PageSize:    int(pageSize),
				CurrentPage: int(page),
				TotalPages:  int(totalPages),
			},
		},
	})
}

func (h *moduleHandler) RegisterRoutes(r *gin.RouterGroup) {
	basePath := "/courses/:courseId/units/:unitId/modules"

	modules := r.Group(basePath)
	{
		modules.GET("", h.GetModules)
		modules.GET("/bulk", h.GetModulesByUnitID)
	}

	authorized := modules.Group("", middleware.Auth())
	{
		authorized.GET("/:moduleId", h.GetModuleWithProgress)
		authorized.POST("", h.CreateModule)
		authorized.PUT("/:moduleId", h.UpdateModule)
		authorized.DELETE("/:moduleId", h.DeleteModule)
		authorized.PUT("/:moduleId/progress", h.UpdateModuleProgress)
	}
}
