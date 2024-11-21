package handlers

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/repository"
	"algolearn/internal/router"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"

	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type ModuleHandler interface {
	CreateModule(w http.ResponseWriter, r *http.Request)
	UpdateModule(w http.ResponseWriter, r *http.Request)
	DeleteModule(w http.ResponseWriter, r *http.Request)
	GetModule(w http.ResponseWriter, r *http.Request)
	GetModuleWithProgress(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
}

type moduleHandler struct {
	moduleRepo repository.ModuleRepository
	userRepo   repository.UserRepository
}

func NewModuleHandler(moduleRepo repository.ModuleRepository,
	userRepo repository.UserRepository) ModuleHandler {
	return &moduleHandler{
		moduleRepo: moduleRepo,
		userRepo:   userRepo,
	}
}

// func (h *moduleHandler) GetModules(w http.ResponseWriter, r *http.Request) {
// 	log := logger.Get()
// 	ctx := r.Context()
// 	params := mux.Vars(r)
// 	query := r.URL.Query()

// 	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
// 	if err != nil {
// 		RespondWithJSON(w, http.StatusBadRequest, models.Response{
// 			Success:   false,
// 			Message:   "invalid unit ID",
// 			ErrorCode: codes.InvalidRequest,
// 		})
// 		return
// 	}

// 	isPartial := query.Get("type") == "partial"
// 	modules, err := h.moduleRepo.GetModules(ctx, unitID, isPartial)
// 	if errors.Is(err, codes.ErrNotFound) {
// 		log.Printf("error fetching modules for unit %d: %v", unitID, err)
// 		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
// 			Success:   false,
// 			ErrorCode: codes.NoData,
// 			Message:   "no modules were found",
// 		})
// 		return
// 	} else if err != nil {
// 		log.Printf("error fetching modules for unit %d: %v", unitID, err)
// 		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
// 			Success:   false,
// 			ErrorCode: codes.DatabaseFail,
// 			Message:   "failed to query modules",
// 		})
// 		return
// 	}

// 	RespondWithJSON(w, http.StatusOK, models.Response{
// 		Success: true,
// 		Message: "modules retrieved successfully",
// 		Data:    modules,
// 	})
// }

func (h *moduleHandler) GetModule(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "UpdateModule")
	query := r.URL.Query()

	queryParams := models.ModuleQueryParams {
		Type: query.Get("type"),
		Include: query.Get("include"),
	}

	if err := queryParams.Validate(); err != nil {
		log.Warn("invalid query parameters", "error", err.Error())
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidRequest,
			Message:   err.Error(),
		})
		return
	}

	if queryParams.Type == "full" && queryParams.Include == "progress" {
		h.GetModuleWithProgress(w, r)
		return
	}

	log.Warn("invalid query parameters")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success: false,
			ErrorCode: codes.InvalidRequest,
			Message: "invalid query parameters",
	})
}

func (h *moduleHandler) GetModuleWithProgress(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetModuleWithProgress")
	ctx := r.Context()
	params := mux.Vars(r)

	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid unit ID parameter in URL",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	moduleID, err := strconv.ParseInt(params["module_id"], 10, 64)
	log.WithField("module_id", moduleID)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid module ID parameter in URL",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	module, err := h.moduleRepo.GetModuleWithProgress(ctx, 4, unitID, moduleID)
	if errors.Is(err, codes.ErrNotFound) {
		log.WithError(err).Warn("module not found")
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "could not retrieve module",
			ErrorCode: codes.NoData,
		})
		return
	} else if err != nil {
		log.WithError(err).Error("error querying module")
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "could not retrieve module",
			ErrorCode: codes.DatabaseFail,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Success: true,
		Message: "module retrieved successfully",
		Data:    module,
	})
}

func (h *moduleHandler) CreateModule(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	ctx := r.Context()

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Success:   false,
			Message:   "unauthorized",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	params := mux.Vars(r)
	unitID, unitIDerr := strconv.ParseInt(params["unit_id"], 10, 64)
	if unitIDerr != nil {
		log.Debug("incorrect unit ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidRequest,
			Message:   "incorrect unit ID format in the route",
		})
		return
	}

	// Only admin users can create modules
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Success:   false,
			Message:   "access denied",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(r.Body).Decode(&module); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   err.Error(),
			ErrorCode: codes.InvalidJson,
		})
		return
	}

	err = module.Validate()
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   err.Error(),
			ErrorCode: codes.InvalidFormData,
		})
		return
	}

	// Setting course and unit IDs we got earlier from the route
	module.ModuleUnitID = unitID

	if err := h.moduleRepo.CreateModule(ctx, &module); err != nil {
		log.Printf("Error creating module: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "Failed to create the module in the database",
			ErrorCode: codes.DatabaseFail,
		})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{
		Success: true,
		Message: "Module created successfully",
		Data:    module,
	})
}

func (h *moduleHandler) UpdateModule(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "UpdateModule")
	ctx := r.Context()
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Success:   false,
			Message:   "Unauthorized",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	// Only admin users can update modules
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Success:   false,
			Message:   "access denied",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	moduleID, err := strconv.ParseInt(params["module_id"], 10, 64)
	if err != nil {
		log.Debug("invalid module ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "Invalid module ID format in the route",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(r.Body).Decode(&module); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
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
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "Module not found",
			ErrorCode: codes.NoData,
		})
		return
	}

	if err := h.moduleRepo.UpdateModule(ctx, &module); err != nil {
		log.Printf("error updating module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "failed to update module in the database",
			ErrorCode: codes.DatabaseFail,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Success: true,
		Message: "module updated successfully",
		Data:    module,
	})
}

func (h *moduleHandler) DeleteModule(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "DeleteModule")

	ctx := r.Context()
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Success:   false,
			Message:   "unauthorized",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	moduleID, err := strconv.ParseInt(params["module_id"], 10, 64)
	log.WithField("module_id", moduleID)
	if err != nil {
		log.WithError(err).Debug("invalid module ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "invalid module ID format in the route",
			ErrorCode: codes.InvalidRequest,
		})
		return
	}

	// Only admin users can delete modules
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Success:   false,
			Message:   "Access denied",
			ErrorCode: codes.Unauthorized,
		})
		return
	}

	_, err = h.moduleRepo.GetModuleWithProgress(ctx, 0, unitID, moduleID)
	if errors.Is(err, codes.ErrNotFound) {
		log.WithError(err).Warn("module not fout")
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "module not found",
			ErrorCode: codes.NoData,
		})
		return
	} else if err != nil {
		log.WithError(err).Error("error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "module not found",
			ErrorCode: codes.NoData,
		})
		return
	}

	err = h.moduleRepo.DeleteModule(ctx, moduleID)
	if errors.Is(err, codes.ErrNotFound) {
		log.Printf("error deleting module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Success:   false,
			Message:   "could not delete module",
			ErrorCode: codes.NoData,
		})
		return
	} else if err != nil {
		log.Printf("Error deleting module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Success:   false,
			Message:   "Could not delete module",
			ErrorCode: codes.DatabaseFail,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Success: true,
		Message: "Module deleted successfully",
	})
}

func (h *moduleHandler) RegisterRoutes(r *router.Router) {
	basePath := "/courses/{course_id}/units/{unit_id}/modules"
	public := r.Group(basePath)
	authorized := r.Group(basePath, middleware.Auth)

	// public.Handle("", h.GetModules, "GET")
	public.Handle("/{module_id}", h.GetModule, "GET")

	authorized.Handle("", h.CreateModule, "POST")
	authorized.Handle("/{module_id}", h.UpdateModule, "PUT")
	authorized.Handle("/{module_id}", h.DeleteModule, "DELETE")
}
