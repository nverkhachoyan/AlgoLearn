package handlers

import (
	"algolearn-backend/internal/config"
	codes "algolearn-backend/internal/errors"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"errors"
	"log"
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

}

type unitHandler struct {
	courseRepo     repository.CourseRepository
	unitRepo repository.UnitRepository
	userRepo repository.UserRepository
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
	ctx := r.Context()
	params := mux.Vars(r)
	courseID, err := strconv.ParseInt(params["course_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_INPUT,
				Message:   "invalid course ID format",
			})
		return
	}

	units, err := h.unitRepo.GetAllUnits(ctx, courseID)
	if err != nil {
		config.Log.Errorf("error fetching units for course %d: %v", courseID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status: "error", ErrorCode: codes.DATABASE_FAIL,
				Message: "could not retrieve units",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "Units retrieved successfully",
			Data:    units,
		})
}

func (h *unitHandler) GetUnitByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_INPUT,
				Message:   "invalid unit ID",
			})
		return
	}

	unit, err := h.unitRepo.GetUnitByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrUnitNotFound) {
            // Return 404 Not Found
            RespondWithJSON(w, http.StatusNotFound,
                models.Response{
                    Status:    "error",
                    ErrorCode: codes.NO_DATA,
                    Message:   "unit not found",
                    Data:      nil,
                })
            return
        }

		log.Printf("error fetching unit %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "could not retrieve unit",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "unit retrieved successfully",
			Data:    unit,
		})
}

func (h *unitHandler) CreateUnit(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := middleware.GetUserID(ctx)
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: codes.UNAUTHORIZED,
				Message:   "unauthorized",
			})
		return
	}

	user, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status: "error",
				Message: "failed to get user by userID",
		})
		return
	}

	// Only admin users can create units
	if user.Role != "admin" {
		config.Log.Debugln("user without admin role tried to create course unit")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:  "error",
				Message: "only users with the admin role may create course units",
			})
		return
	}

	params := mux.Vars(r)
	courseID, err := strconv.ParseInt(params["course_id"], 10, 64)
	if err != nil {
		config.Log.Debugln("invalid format for course id in route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			ErrorCode: codes.INVALID_INPUT,
			Message:   "invalid format for course id in route",
		})
	}

	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_JSON,
				Message:   "invalid JSON or mismatching attributes",
			})
		return
	}
	unit.CourseID = courseID

	newUnit, err := h.unitRepo.CreateUnit(ctx, &unit)
	if err != nil {
		config.Log.Errorf("error creating unit: %v\n", err.Error())
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   err.Error(),
			})
		return
	}

	RespondWithJSON(w, http.StatusCreated,
		models.Response{
			Status:  "success",
			Message: "unit created successfully",
			Data:    newUnit,
		})
}

func (h *unitHandler) UpdateUnit(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: codes.UNAUTHORIZED,
				Message:   "you are not authorized to make this request",
			})
		return
	}

	// Only admin users can update units
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		config.Log.Debugf("user without admin role tried to update course unit: Detailed Error: %v", err)
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:    "error",
				ErrorCode: codes.UNAUTHORIZED,
				Message:   "only users with admin role are allowed to update course units",
			})
		return
	}

	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_INPUT,
				Message:   "Invalid unit ID format",
			})
		return
	}

	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_JSON,
				Message:   "Invalid JSON or mismatching attributes"})
		return
	}
	unit.ID = unitID

	newUnit, err := h.unitRepo.UpdateUnit(ctx, &unit)
	if  err != nil {
		log.Printf("Error updating unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   err.Error(),
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "Unit updated successfully",
			Data: newUnit,
		})
}

func (h *unitHandler) DeleteUnit(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := middleware.GetUserID(ctx)
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: codes.UNAUTHORIZED,
				Message:   "Unauthorized",
			})
		return
	}

	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_INPUT,
				Message:   "Invalid unit ID format",
			})
		return
	}

	// Only admin users can delete units
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		config.Log.Debugf("User without admin role tried to delete course unit")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:    "error",
				ErrorCode: codes.UNAUTHORIZED,
				Message:   "Only users with the admin role may delete a course unit",
			})
		return
	}

	if err := h.unitRepo.DeleteUnit(ctx, unitID); err != nil {
		log.Printf("Error deleting unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "Could not delete unit",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "Unit deleted successfully",
		})
}