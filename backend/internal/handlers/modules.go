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

// GetModuleWithProgress handles GET /modules/:moduleId/progress
// Returns details of a module with user's progress information
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

	module, hasNextModule, nextModuleID, err := h.moduleRepo.GetModuleWithProgress(ctx, int64(userID), unitID, moduleID)
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
		Payload: models.ModuleWithProgressResponse{
			Module:        *module,
			HasNextModule: hasNextModule,
			NextModuleID:  nextModuleID,
		},
	})
}

// CreateModule handles POST /modules
// Creates a new module in a unit
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

	var module models.Module
	if err := json.NewDecoder(c.Request.Body).Decode(&module); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidJson,
			Message:   "invalid request body: " + err.Error(),
		})
		return
	}

	if err := module.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidFormData,
			Message:   "validation error: " + err.Error(),
		})
		return
	}

	module.ModuleUnitID = unitID
	createdModule, err := h.moduleRepo.CreateModule(ctx, unitID, module.Name, module.Description)
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

// UpdateModule handles PUT /modules/:moduleId
// Updates an existing module
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

// DeleteModule handles DELETE /modules/:moduleId
// Deletes an existing module
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

// UpdateModuleProgress handles POST /modules/:moduleId/progress
// Updates the progress of a user in a module
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

// GetModules handles GET /modules
// Returns a paginated list of modules for a unit
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

	// Public routes
	modules := r.Group(basePath)
	{
		modules.GET("", h.GetModules) // GET /modules
	}

	// Protected routes
	authorized := modules.Group("", middleware.Auth())
	{
		authorized.GET("/:moduleId", h.GetModuleWithProgress)         // GET /modules/:moduleId
		authorized.POST("", h.CreateModule)                           // POST /modules
		authorized.PUT("/:moduleId", h.UpdateModule)                  // PUT /modules/:moduleId
		authorized.DELETE("/:moduleId", h.DeleteModule)               // DELETE /modules/:moduleId
		authorized.PUT("/:moduleId/progress", h.UpdateModuleProgress) // PUT /modules/:moduleId/progress
	}
}
