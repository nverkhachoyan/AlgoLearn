package handlers

import (
	"algolearn-backend/internal/config"
	codes "algolearn-backend/internal/errors"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/router"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type ModuleHandler interface {
	GetModules(w http.ResponseWriter, r *http.Request)
	GetModuleByModuleID(w http.ResponseWriter, r *http.Request)
	CreateModule(w http.ResponseWriter, r *http.Request)
	UpdateModule(w http.ResponseWriter, r *http.Request)
	DeleteModule(w http.ResponseWriter, r *http.Request)
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

func (h *moduleHandler) GetModules(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "invalid unit ID",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	isPartial := r.URL.Query().Get("type") == "partial"
	modules, err := h.moduleRepo.GetModules(ctx, unitID, isPartial)
	if err != nil {
		log.Printf("error fetching modules for unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "could not retrieve modules",
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "modules retrieved successfully",
		Data:    modules,
	})
}

func (h *moduleHandler) GetModuleByModuleID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	moduleID, err := strconv.ParseInt(params["module_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	module, err := h.moduleRepo.GetModuleByModuleID(ctx, unitID, moduleID)
	if err != nil {
		log.Printf("Error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve module",
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Module retrieved successfully",
		Data:    module,
	})
}

func (h *moduleHandler) CreateModule(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	unitID, unitIDerr := strconv.ParseInt(params["unit_id"], 10, 64)
	if unitIDerr != nil {
		config.Log.Debug("incorrect unit ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			ErrorCode: codes.INVALID_REQUEST,
			Message:   "incorrect unit ID format in the route",
		})
		return
	}

	// Only admin users can create modules
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(r.Body).Decode(&module); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   err.Error(),
			ErrorCode: codes.INVALID_JSON,
		})
		return
	}

	// Setting course and unit IDs we got earlier from the route
	module.UnitID = unitID

	if err := h.moduleRepo.CreateModule(ctx, &module); err != nil {
		log.Printf("Error creating module: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to create the module in the database",
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{
		Status:  "success",
		Message: "Module created successfully",
		Data:    module,
	})
}

func (h *moduleHandler) UpdateModule(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can update modules
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	moduleID, err := strconv.ParseInt(params["module_id"], 10, 64)
	if err != nil {
		config.Log.Debug("Invalid module ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID format in the route",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(r.Body).Decode(&module); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: codes.INVALID_JSON,
		})
		return
	}
	module.ID = moduleID

	_, err = h.moduleRepo.GetModuleByModuleID(ctx, unitID, moduleID)
	if err != nil {
		log.Printf("Error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:    "error",
			Message:   "Module not found",
			ErrorCode: codes.NO_DATA,
		})
		return
	}

	if err := h.moduleRepo.UpdateModule(ctx, &module); err != nil {
		log.Printf("Error updating module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to update module in the database",
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Module updated successfully",
	})
}

func (h *moduleHandler) DeleteModule(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	moduleID, err := strconv.ParseInt(params["module_id"], 10, 64)
	if err != nil {
		config.Log.Debug("Invalid module ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID format in the route",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	// Only admin users can delete modules
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	_, err = h.moduleRepo.GetModuleByModuleID(ctx, unitID, moduleID)
	if err != nil {
		log.Printf("Error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:    "error",
			Message:   "Module not found",
			ErrorCode: codes.NO_DATA,
		})
		return
	}

	if err := h.moduleRepo.DeleteModule(ctx, moduleID); err != nil {
		log.Printf("Error deleting module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not delete module",
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Module deleted successfully",
	})
}

// *********************************
// *** MODULE QUESTIONS HANDLERS ***
// *********************************

func (h *moduleHandler) GetAllModuleQuestions(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	moduleID, err := strconv.Atoi(params["module_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	questions, err := repository.GetQuestionsByModuleID(moduleID)
	if err != nil {
		config.Log.Debugf("Error fetching questions for module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to retrieve questions from database",
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	if len(questions) == 0 {
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:  "success",
			Message: "No questions found for the given module ID",
			Data:    []models.ModuleQuestion{},
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Questions retrieved successfully",
		Data:    questions,
	})
}

func (h *moduleHandler) CreateModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	moduleID, err := strconv.Atoi(params["module_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID format",
			ErrorCode: codes.INVALID_REQUEST,
		})
	}

	// Only admin users can create questions
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	var question models.ModuleQuestion
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: codes.INVALID_JSON,
		})
		return
	}
	question.ModuleID = moduleID

	if err := repository.CreateQuestion(&question); err != nil {
		log.Printf("Error creating question: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   err.Error(),
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{
		Status:  "success",
		Message: "Question created successfully",
		Data:    question,
	})
}

func (h *moduleHandler) UpdateModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	moduleID, moduleIDErr := strconv.Atoi(params["module_id"])
	moduleQuestionID, moduleQIDerr := strconv.ParseInt(params["module_question_id"], 10, 64)
	if moduleIDErr != nil || moduleQIDerr != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module or question ID format",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	// Only admin users can update questions
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	var question models.ModuleQuestion
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: codes.INVALID_JSON,
		})
		return
	}
	question.ModuleID = moduleID
	question.ID = moduleQuestionID

	if err := repository.UpdateQuestion(&question); err != nil {
		config.Log.Debugf("Error updating question %d: %v", moduleQuestionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   err.Error(),
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Question updated successfully",
	})
}

func (h *moduleHandler) DeleteModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	moduleID, moduleIDErr := strconv.Atoi(params["module_id"])
	moduleQuestionID, moduleQIDerr := strconv.Atoi(params["module_question_id"])
	if moduleIDErr != nil || moduleQIDerr != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module or question ID format",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	// Only admin users can delete questions
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: codes.UNAUTHORIZED,
		})
		return
	}

	if err := repository.DeleteQuestion(moduleID, moduleQuestionID); err != nil {
		log.Printf("Error deleting question %d: %v", moduleQuestionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   err.Error(),
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Question deleted successfully",
	})
}

func (h *moduleHandler) RegisterRoutes(r *router.Router) {
	basePath := "/courses/{course_id}/units/{unit_id}/modules"
	public := r.Group(basePath)
	authorized := r.Group(basePath, middleware.Auth)

	public.Handle("", h.GetModules, "GET")
	public.Handle("/{module_id}", h.GetModuleByModuleID, "GET")

	authorized.Handle("", h.CreateModule, "POST")
	authorized.Handle("/{module_id}", h.UpdateModule, "PUT")
	authorized.Handle("/{module_id}", h.DeleteModule, "DELETE")
}
