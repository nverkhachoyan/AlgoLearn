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
	GetModule(c *gin.Context)
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

func (h *moduleHandler) GetModule(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "UpdateModule")
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
		ErrorCode: httperr.InvalidRequest,
		Message:   "invalid query parameters",
	})
}

func (h *moduleHandler) GetModuleWithProgress(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetModuleWithProgress")
	ctx := c.Request.Context()
	params := c.Params

	unitID, err := strconv.ParseInt(params.ByName("unitId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid unit ID parameter in URL",
			ErrorCode: httperr.InvalidRequest,
		})
		return
	}

	moduleID, err := strconv.ParseInt(params.ByName("moduleId"), 10, 64)
	log.WithField("module_id", moduleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid module ID parameter in URL",
			ErrorCode: httperr.InvalidRequest,
		})
		return
	}

	module, hasNextModule, nextModuleID, err := h.moduleRepo.GetModuleWithProgress(ctx, 4, unitID, moduleID)
	if errors.Is(err, httperr.ErrNotFound) {
		log.WithError(err).Warn("module not found")
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "could not retrieve module",
			ErrorCode: httperr.NoData,
		})
		return
	} else if err != nil {
		log.WithError(err).Error("error querying module")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "could not retrieve module",
			ErrorCode: httperr.DatabaseFail,
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "module retrieved successfully",
		Payload: models.ModuleWithProgressResponse{
			Module:        *module,
			HasNextModule: hasNextModule,
			NextModuleID:  nextModuleID,
		},
	})
}

func (h *moduleHandler) CreateModule(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "CreateModule")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			Message:   "unauthorized",
			ErrorCode: httperr.Unauthorized,
		})
		return
	}

	params := c.Params
	unitID, unitIDerr := strconv.ParseInt(params.ByName("unitId"), 10, 64)
	if unitIDerr != nil {
		log.Debug("incorrect unit ID format in the route")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidRequest,
			Message:   "incorrect unit ID format in the route",
		})
		return
	}

	user, err := h.userRepo.GetUserByID(ctx, int32(userID))
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			Message:   "access denied",
			ErrorCode: httperr.Unauthorized,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(c.Request.Body).Decode(&module); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   err.Error(),
			ErrorCode: httperr.InvalidJson,
		})
		return
	}

	err = module.Validate()
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   err.Error(),
			ErrorCode: httperr.InvalidFormData,
		})
		return
	}

	module.ModuleUnitID = unitID

	createdModule, err := h.moduleRepo.CreateModule(ctx, unitID, module.Name, module.Description)
	if err != nil {
		log.Printf("Error creating module: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "Failed to create the module in the database",
			ErrorCode: httperr.DatabaseFail,
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "Module created successfully",
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
			Message:   "Unauthorized",
			ErrorCode: httperr.Unauthorized,
		})
		return
	}

	// Only admin users can update modules
	user, err := h.userRepo.GetUserByID(ctx, int32(userID))
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			Message:   "access denied",
			ErrorCode: httperr.Unauthorized,
		})
		return
	}

	params := c.Params
	moduleID, err := strconv.ParseInt(params.ByName("moduleId"), 10, 64)
	if err != nil {
		log.Debug("invalid module ID format in the route")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "Invalid module ID format in the route",
			ErrorCode: httperr.InvalidRequest,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(c.Request.Body).Decode(&module); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "Invalid input",
			ErrorCode: httperr.InvalidJson,
		})
		return
	}

	updatedModule, err := h.moduleRepo.UpdateModule(ctx, moduleID, module.Name, module.Description)
	if err != nil {
		log.Printf("error updating module %d: %v", moduleID, err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "failed to update module in the database",
			ErrorCode: httperr.DatabaseFail,
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
			Message:   "unauthorized",
			ErrorCode: httperr.Unauthorized,
		})
		return
	}

	params := c.Params
	unitID, err := strconv.ParseInt(params.ByName("unitId"), 10, 64)
	if err != nil {
		log.WithError(err).Debug("invalid unit ID format in the route")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid unit ID format in the route",
			ErrorCode: httperr.InvalidRequest,
		})
		return
	}

	moduleID, err := strconv.ParseInt(params.ByName("moduleId"), 10, 64)
	log.WithField("module_id", moduleID)
	if err != nil {
		log.WithError(err).Debug("invalid module ID format in the route")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid module ID format in the route",
			ErrorCode: httperr.InvalidRequest,
		})
		return
	}

	// Only admin users can delete modules
	user, err := h.userRepo.GetUserByID(ctx, int32(userID))
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			Message:   "Access denied",
			ErrorCode: httperr.Unauthorized,
		})
		return
	}

	_, _, _, err = h.moduleRepo.GetModuleWithProgress(ctx, 0, unitID, moduleID)
	if errors.Is(err, httperr.ErrNotFound) {
		log.WithError(err).Warn("module not fout")
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "module not found",
			ErrorCode: httperr.NoData,
		})
		return
	} else if err != nil {
		log.WithError(err).Errorf("error fetching module %d: %v", moduleID, err)
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "module not found",
			ErrorCode: httperr.NoData,
		})
		return
	}

	err = h.moduleRepo.DeleteModule(ctx, moduleID)
	if errors.Is(err, httperr.ErrNotFound) {
		log.Printf("error deleting module %d: %v", moduleID, err)
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "could not delete module",
			ErrorCode: httperr.NoData,
		})
		return
	} else if err != nil {
		log.Printf("Error deleting module %d: %v", moduleID, err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "Could not delete module",
			ErrorCode: httperr.DatabaseFail,
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Module deleted successfully",
	})
}

func (h *moduleHandler) UpdateModuleProgress(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "UpdateModuleProgress")
	ctx := c.Request.Context()
	params := c.Params

	userID, err := GetUserID(c)
	if err != nil {
		log.Errorf("invalid userIid query parameter")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidRequest,
			Message:   "invalid userIid query parameters",
		})
		return
	}

	moduleID, err := strconv.ParseInt(params.ByName("moduleId"), 10, 64)
	if err != nil {
		log.WithError(err).Errorf("invalid module_id query parameter")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidRequest,
			Message:   "invalid module_id query parameter",
		})
		return
	}

	var batch models.BatchModuleProgress
	if err = json.NewDecoder(c.Request.Body).Decode(&batch); err != nil {
		log.WithError(err).Errorf("failed to unmarshal request")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidRequest,
			Message:   "failed to unmarshal request",
		})
		return
	}

	if h.moduleRepo == nil {
		log.Error("moduleRepo is not initialized")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.InternalError,
			Message:   "internal server error",
		})
		return
	}

	err = h.moduleRepo.SaveModuleProgress(ctx, int64(userID), moduleID, batch.Sections, batch.Questions)
	if errors.Is(err, httperr.ErrNotFound) {
		log.WithError(err).Errorf("resource not found")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.NoData,
			Message:   "resource not found",
		})
		return
	} else if err != nil {
		log.WithError(err).Errorf("failed to update module progress")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InternalError,
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
	log := h.log.WithBaseFields(logger.Handler, "GetModules")
	ctx := c.Request.Context()
	params := c.Params
	query := c.Request.URL.Query()

	unitID, err := strconv.ParseInt(params.ByName("unitId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid unit ID",
			ErrorCode: httperr.InvalidRequest,
		})
		return
	}

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid user ID",
			ErrorCode: httperr.InvalidRequest,
		})
		return
	}

	page, err := strconv.ParseInt(query.Get("currentPage"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid page number",
			ErrorCode: httperr.InvalidRequest,
		})
		return
	}

	pageSize, err := strconv.ParseInt(query.Get("pageSize"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid page size",
			ErrorCode: httperr.InvalidRequest,
		})
		return
	}

	modules, err := h.moduleRepo.GetModulesWithProgress(ctx, int64(userID), unitID, int(page), int(pageSize))
	if err != nil {
		log.WithError(err).Error("error fetching modules")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "could not retrieve modules from the database",
		})
		return
	}

	totalCount, err := h.moduleRepo.GetModuleTotalCount(ctx, unitID)
	if err != nil {
		log.WithError(err).Error("error fetching total count")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "could not retrieve total count",
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
	modules.GET("", h.GetModules)
	modules.GET("/:moduleId", h.GetModule)

	// Protected routes (require authentication)
	authorized := modules.Group("", middleware.Auth())
	authorized.POST("", h.CreateModule)
	authorized.PUT("/:moduleId", h.UpdateModule)
	authorized.DELETE("/:moduleId", h.DeleteModule)
	authorized.POST("/:moduleId/progress", h.UpdateModuleProgress)
}
