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

type UnitHandler interface {
	GetAllUnits(w http.ResponseWriter, r *http.Request)
	GetUnitByID(w http.ResponseWriter, r *http.Request)
	CreateUnit(w http.ResponseWriter, r *http.Request)
	UpdateUnit(w http.ResponseWriter, r *http.Request)
	DeleteUnit(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
}

type unitHandler struct {
	courseRepo repository.CourseRepository
	unitRepo   repository.UnitRepository
	userRepo   repository.UserRepository
}

func NewUnitHandler(
	unitRepo repository.UnitRepository,
	userRepo repository.UserRepository) UnitHandler {
	return &unitHandler{
		unitRepo: unitRepo,
		userRepo: userRepo,
	}
}

func (h *unitHandler) GetAllUnits(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	ctx := r.Context()
	params := mux.Vars(r)
	courseID, err := strconv.ParseInt(params["course_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidInput,
				Message:   "invalid course ID format",
			})
		return
	}

	units, err := h.unitRepo.GetAllUnits(ctx, courseID)
	if err != nil {
		log.Errorf("error fetching units for course %d: %v", courseID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "could not retrieve units",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
			Message: "Units retrieved successfully",
			Data:    units,
		})
}

func (h *unitHandler) GetUnitByID(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	ctx := r.Context()
	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidInput,
				Message:   "invalid unit ID",
			})
		return
	}

	unit, err := h.unitRepo.GetUnitByID(ctx, id)
	if err != nil {
		if errors.Is(err, codes.ErrNotFound) {
			// Return 404 Not Found
			RespondWithJSON(w, http.StatusNotFound,
				models.Response{
					Success:   false,
					ErrorCode: codes.NoData,
					Message:   "unit not found",
					Data:      nil,
				})
			return
		}

		log.Printf("error fetching unit %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "could not retrieve unit",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
			Message: "unit retrieved successfully",
			Data:    unit,
		})
}

func (h *unitHandler) CreateUnit(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()

	ctx := r.Context()
	userID, ok := middleware.GetUserID(ctx)
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "Unauthorized",
			})
		return
	}

	user, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success: false,
				Message: "failed to get user by userID",
			})
		return
	}

	// Only admin users can create units
	if user.Role != "admin" {
		log.Debugln("user without admin role tried to create course unit")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Success: false,
				Message: "only users with the admin role may create course units",
			})
		return
	}

	params := mux.Vars(r)
	courseID, err := strconv.ParseInt(params["course_id"], 10, 64)
	if err != nil {
		log.Debugln("invalid format for course id in route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidInput,
			Message:   "invalid format for course id in route",
		})
	}

	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidJson,
				Message:   "invalid JSON or mismatching attributes",
			})
		return
	}
	unit.CourseID = courseID

	newUnit, err := h.unitRepo.CreateUnit(ctx, &unit)
	if err != nil {
		log.Errorf("error creating unit: %v\n", err.Error())
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   err.Error(),
			})
		return
	}

	RespondWithJSON(w, http.StatusCreated,
		models.Response{
			Success: true,
			Message: "unit created successfully",
			Data:    newUnit,
		})
}

func (h *unitHandler) UpdateUnit(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	ctx := r.Context()

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "you are not authorized to make this request",
			})
		return
	}

	// Only admin users can update units
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		log.Debugf("user without admin role tried to update course unit: Detailed Error: %v", err)
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "only users with admin role are allowed to update course units",
			})
		return
	}

	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidInput,
				Message:   "Invalid unit ID format",
			})
		return
	}

	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidJson,
				Message:   "Invalid JSON or mismatching attributes"})
		return
	}
	unit.ID = unitID

	newUnit, err := h.unitRepo.UpdateUnit(ctx, &unit)
	if errors.Is(err, codes.ErrNotFound) {
		log.WithFields(logger.Fields{"func": "UpdateUnit", "unitID": unitID}).Debugln("attempt to update unit that does not exist")
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.NoData,
				Message:   "unit not found",
			})
		return
	} else if err != nil {
		log.WithFields(logger.Fields{"func": "UpdateUnit", "unitID": unitID}).Debugln("error updating unit")
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   err.Error(),
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
			Message: "unit updated successfully",
			Data:    newUnit,
		})
}

func (h *unitHandler) DeleteUnit(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	ctx := r.Context()

	userID, ok := middleware.GetUserID(ctx)
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "unauthorized",
			})
		return
	}

	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidInput,
				Message:   "invalid unit ID format",
			})
		return
	}

	// Only admin users can delete units
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		log.Debugf("user without admin role tried to delete course unit")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "only users with the admin role may delete a course unit",
			})
		return
	}

	err = h.unitRepo.DeleteUnit(ctx, unitID)
	if errors.Is(err, codes.ErrNotFound) {
		log.WithFields(logger.Fields{"func": "DeleteUnit", "unitID": unitID}).Debugln("attempt to delete nonexistent unit")
		RespondWithJSON(w, http.StatusNotFound,
			models.Response{
				Success:   false,
				ErrorCode: codes.NoData,
				Message:   "unit not found",
			})
		return
	} else if err != nil {
		log.Printf("Error deleting unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "could not delete unit",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
			Message: "unit deleted successfully",
		})
}

func (h *unitHandler) RegisterRoutes(r *router.Router) {
	// Course-specific units
	courseUnitsPublic := r.Group("/courses/{course_id}/units")
	courseUnitsAuth := r.Group("/courses/{course_id}/units", middleware.Auth)

	courseUnitsPublic.Handle("", h.GetAllUnits, "GET")
	courseUnitsAuth.Handle("", h.CreateUnit, "POST")

	// Individual unit operations
	unitsPublic := r.Group("/units")
	unitsAuth := r.Group("/units", middleware.Auth)

	unitsPublic.Handle("/{id}", h.GetUnitByID, "GET")
	unitsAuth.Handle("/{unit_id}", h.UpdateUnit, "PUT")
	unitsAuth.Handle("/{unit_id}", h.DeleteUnit, "DELETE")
}
