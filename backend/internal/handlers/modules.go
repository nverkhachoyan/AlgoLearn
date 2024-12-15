package handlers

import (
	codes "algolearn/internal/errors"
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
	GetModule(c *gin.Context)
	GetModuleWithProgress(c *gin.Context)
	UpdateModuleProgress(c *gin.Context)
	GetModules(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
}

type moduleHandler struct {
	moduleRepo service.ModuleService
	userRepo   service.UserService
}

func NewModuleHandler(moduleRepo service.ModuleService,
	userRepo service.UserService) ModuleHandler {
	return &moduleHandler{
		moduleRepo: moduleRepo,
		userRepo:   userRepo,
	}
}

func (h *moduleHandler) GetModule(c *gin.Context) {
	log := logger.Get().WithBaseFields(logger.Handler, "UpdateModule")
	query := c.Request.URL.Query()

	queryParams := models.ModuleQueryParams{
		Type:   query.Get("type"),
		Filter: query.Get("filter"),
	}

	if queryParams.Type == "full" && queryParams.Filter == "learning" {
		h.GetModuleWithProgress(c)
		return
	}

	log.Warn("invalid query parameters")
	c.JSON(http.StatusBadRequest, models.Response{
		Success:   false,
		ErrorCode: codes.InvalidRequest,
		Message:   "invalid query parameters",
	})
}

func (h *moduleHandler) GetModuleWithProgress(c *gin.Context) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetModuleWithProgress")
	ctx := c.Request.Context()
	params := c.Params

	unitID, err := strconv.ParseInt(params.ByName("unit_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid unit ID parameter in URL",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	moduleID, err := strconv.ParseInt(params.ByName("module_id"), 10, 64)
	log.WithField("module_id", moduleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid module ID parameter in URL",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	modulePayload, err := h.moduleRepo.GetModuleWithProgress(ctx, 4, unitID, moduleID)
	if errors.Is(err, codes.ErrNotFound) {
		log.WithError(err).Warn("module not found")
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "could not retrieve module",
			ErrorCode: codes.NoData,
		})
		return
	} else if err != nil {
		log.WithError(err).Error("error querying module")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "could not retrieve module",
			ErrorCode: codes.DatabaseFail,
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "module retrieved successfully",
		Data:    modulePayload,
	})
}

func (h *moduleHandler) CreateModule(c *gin.Context) {
	log := logger.Get()
	ctx := c.Request.Context()

	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			Message:   "unauthorized",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	params := c.Params
	unitID, unitIDerr := strconv.ParseInt(params.ByName("unit_id"), 10, 64)
	if unitIDerr != nil {
		log.Debug("incorrect unit ID format in the route")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidRequest,
			Message:   "incorrect unit ID format in the route",
		})
		return
	}

	// Only admin users can create modules
	user, err := h.userRepo.GetUserByID(int32(userID.(int64)))
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			Message:   "access denied",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(c.Request.Body).Decode(&module); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   err.Error(),
			ErrorCode: codes.InvalidJson,
		})
		return
	}

	err = module.Validate()
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   err.Error(),
			ErrorCode: codes.InvalidFormData,
		})
		return
	}

	// Setting course and unit IDs we got earlier from the route
	module.ModuleUnitID = unitID

	if err := h.moduleRepo.CreateModule(ctx, int32(userID.(int64)), &module); err != nil {
		log.Printf("Error creating module: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "Failed to create the module in the database",
			ErrorCode: codes.DatabaseFail,
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "Module created successfully",
		Data:    module,
	})
}

func (h *moduleHandler) UpdateModule(c *gin.Context) {
	log := logger.Get().WithBaseFields(logger.Handler, "UpdateModule")
	ctx := c.Request.Context()
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			Message:   "Unauthorized",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	// Only admin users can update modules
	user, err := h.userRepo.GetUserByID(int32(userID.(int64)))
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			Message:   "access denied",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	params := c.Params
	unitID, err := strconv.ParseInt(params.ByName("unit_id"), 10, 64)
	moduleID, err := strconv.ParseInt(params.ByName("module_id"), 10, 64)
	if err != nil {
		log.Debug("invalid module ID format in the route")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "Invalid module ID format in the route",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(c.Request.Body).Decode(&module); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "Invalid input",
			ErrorCode: codes.InvalidJson,
		})
		return
	}
	module.ID = moduleID

	_, err = h.moduleRepo.GetModuleWithProgress(ctx, 0, unitID, moduleID)
	if err != nil {
		log.Printf("error fetching module %d: %v", moduleID, err)
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "Module not found",
			ErrorCode: codes.NoData,
		})
		return
	}

	if err := h.moduleRepo.UpdateModule(ctx, &module); err != nil {
		log.Printf("error updating module %d: %v", moduleID, err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "failed to update module in the database",
			ErrorCode: codes.DatabaseFail,
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "module updated successfully",
		Data:    module,
	})
}

func (h *moduleHandler) DeleteModule(c *gin.Context) {
	log := logger.Get().WithBaseFields(logger.Handler, "DeleteModule")

	ctx := c.Request.Context()
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			Message:   "unauthorized",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	params := c.Params
	unitID, err := strconv.ParseInt(params.ByName("unit_id"), 10, 64)
	moduleID, err := strconv.ParseInt(params.ByName("module_id"), 10, 64)
	log.WithField("module_id", moduleID)
	if err != nil {
		log.WithError(err).Debug("invalid module ID format in the route")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid module ID format in the route",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	// Only admin users can delete modules
	user, err := h.userRepo.GetUserByID(int32(userID.(int64)))
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			Message:   "Access denied",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	_, err = h.moduleRepo.GetModuleWithProgress(ctx, 0, unitID, moduleID)
	if errors.Is(err, codes.ErrNotFound) {
		log.WithError(err).Warn("module not fout")
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "module not found",
			ErrorCode: codes.NoData,
		})
		return
	} else if err != nil {
		log.WithError(err).Errorf("error fetching module %d: %v", moduleID, err)
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "module not found",
			ErrorCode: codes.NoData,
		})
		return
	}

	err = h.moduleRepo.DeleteModule(ctx, moduleID)
	if errors.Is(err, codes.ErrNotFound) {
		log.Printf("error deleting module %d: %v", moduleID, err)
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "could not delete module",
			ErrorCode: codes.NoData,
		})
		return
	} else if err != nil {
		log.Printf("Error deleting module %d: %v", moduleID, err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "Could not delete module",
			ErrorCode: codes.DatabaseFail,
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Module deleted successfully",
	})
}

func (h *moduleHandler) UpdateModuleProgress(c *gin.Context) {
	log := logger.Get().WithBaseFields(logger.Handler, "UpdateModuleProgress")
	ctx := c.Request.Context()
	query := c.Request.URL.Query()
	params := c.Params

	userID, err := strconv.ParseInt(query.Get("userId"), 10, 32)
	if err != nil {
		log.WithError(err).Errorf("invalid userIid query parameter")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidRequest,
			Message:   "invalid userIid query parameters",
		})
		return
	}

	unitID, err := strconv.ParseInt(params.ByName("unit_id"), 10, 64)
	if err != nil {
		log.WithError(err).Errorf("invalid unit_id query parameter")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidRequest,
			Message:   "invalid unit_id query parameter",
		})
		return
	}

	moduleID, err := strconv.ParseInt(params.ByName("module_id"), 10, 64)
	if err != nil {
		log.WithError(err).Errorf("invalid module_id query parameter")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidRequest,
			Message:   "invalid module_id query parameter",
		})
		return
	}

	var batch models.BatchModuleProgress
	if err = json.NewDecoder(c.Request.Body).Decode(&batch); err != nil {
		log.WithError(err).Errorf("failed to unmarshal request")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidRequest,
			Message:   "failed to unmarshal request",
		})
		return
	}

	if h.moduleRepo == nil {
		log.Error("moduleRepo is not initialized")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: codes.InternalError,
			Message:   "internal server error",
		})
		return
	}

	err = h.moduleRepo.UpdateModuleProgress(ctx, int32(userID), unitID, moduleID, &batch)
	if errors.Is(err, codes.ErrNotFound) {
		log.WithError(err).Errorf("resource not found")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.NoData,
			Message:   "resource not found",
		})
		return
	} else if err != nil {
		log.WithError(err).Errorf("failed to update module progress")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InternalError,
			Message:   "failed to update module progress",
		})
		return
	}

	c.JSON(http.StatusAccepted, models.Response{
		Success: true,
		Message: "successfully updated user module progress",
	})
}

func (h *moduleHandler) GetModules(c *gin.Context) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetModules")
	ctx := c.Request.Context()
	params := c.Params
	query := c.Request.URL.Query()

	unitID, err := strconv.ParseInt(params.ByName("unit_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid unit ID",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	userID, err := strconv.ParseInt(query.Get("userId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid user ID",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	page, err := strconv.ParseInt(query.Get("currentPage"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid page number",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	pageSize, err := strconv.ParseInt(query.Get("pageSize"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid page size",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	totalCount, modules, err := h.moduleRepo.GetModulesWithProgress(ctx, page, pageSize, int32(userID), unitID)
	if err != nil {
		log.WithError(err).Error("error fetching modules")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: codes.DatabaseFail,
			Message:   "could not retrieve modules from the database",
		})
		return
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "modules retrieved successfully",
		Data: models.PaginatedPayload{
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
	basePath := "/courses/{course_id}/units/{unit_id}/modules"
	public := r.Group(basePath)
	authorized := r.Group(basePath, middleware.Auth())

	// Progress endpoints
	progressPath := basePath + "/{module_id}/progress"
	progress := r.Group(progressPath)
	progress.POST("", h.UpdateModuleProgress)

	public.GET("", h.GetModules)
	public.GET("/:module_id", h.GetModule)

	authorized.POST("", h.CreateModule)
	authorized.PUT("/:module_id", h.UpdateModule)
	authorized.DELETE("/:module_id", h.DeleteModule)
}
