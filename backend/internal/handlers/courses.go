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
	"fmt"

	"github.com/gorilla/mux"
)

type CourseHandler interface {
	GetAllCourses(w http.ResponseWriter, r *http.Request)
	GetCourseByID(w http.ResponseWriter, r *http.Request)
	CreateCourse(w http.ResponseWriter, r *http.Request)
	UpdateCourse(w http.ResponseWriter, r *http.Request)
	DeleteCourse(w http.ResponseWriter, r *http.Request)
	GetAllUnits(w http.ResponseWriter, r *http.Request)
	GetUnitByID(w http.ResponseWriter, r *http.Request)
	CreateUnit(w http.ResponseWriter, r *http.Request)
	UpdateUnit(w http.ResponseWriter, r *http.Request)
	DeleteUnit(w http.ResponseWriter, r *http.Request)
	GetAllModules(w http.ResponseWriter, r *http.Request)
	GetAllModulesPartial(w http.ResponseWriter, r *http.Request)
	GetModuleByModuleID(w http.ResponseWriter, r *http.Request)
	CreateModule(w http.ResponseWriter, r *http.Request)
	UpdateModule(w http.ResponseWriter, r *http.Request)
	DeleteModule(w http.ResponseWriter, r *http.Request)
}

type courseHandler struct {
	courseRepo     repository.CourseRepository
	userRepo repository.UserRepository
}

func NewCourseHandler(courseRepo repository.CourseRepository, userRepo repository.UserRepository) CourseHandler {
	return &courseHandler{courseRepo: courseRepo, userRepo: userRepo}
}

// *****************
// **** COURSES ****
// *****************

func (h *courseHandler) GetAllCourses(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	courses, err := h.courseRepo.GetAllCourses(ctx)
	if err != nil {
		config.Log.Debugf("error fetching courses: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "could not retrieve courses from the database",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "courses retrieved successfully",
			Data:    courses,
		})
}

func (h *courseHandler) GetCourseByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		config.Log.Debugf("tried to retrieve a course with an invalid course ID: %d\n", id)
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_INPUT,
				Message:   "invalid course ID",
			})
		return
	}

	course, err := h.courseRepo.GetCourseByID(ctx, id)
	if err != nil {
		config.Log.Debugf("error fetching course from database %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "could not retrieve course from the database",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "course retrieved successfully",
			Data:    course,
		})
}

func (h *courseHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	 userID, ok := middleware.GetUserID(ctx)
	 fmt.Printf("UserID in CreateCourse: %v Error: %v", userID, ok)
	 if !ok {
	 	config.Log.Debugln("unauthorized user tried to create course.")
	 	RespondWithJSON(w, http.StatusUnauthorized,
	 		models.Response{
	 			Status:    "error",
	 			ErrorCode: codes.UNAUTHORIZED,
	 			Message:   "unauthorized",
	 		})
	 	return
	 }

	//	 Only admin users can create courses
	 user, err := h.userRepo.GetUserByID(userID)
	 if err != nil {
	 	config.Log.Errorf("failed to get user with user ID %d, %v\n", userID, err.Error())
	 	RespondWithJSON(w, http.StatusForbidden,
	 		models.Response{
	 			Status:    "error",
	 			ErrorCode: codes.DATABASE_FAIL,
	 			Message:   "failed to get user by ID from database",
	 		})
	 	return
	 }

	 if user.Role != "admin" {
	 	config.Log.Debugln("user without admin role tried to create course")
	 	RespondWithJSON(w, http.StatusForbidden,
	 		models.Response{
	 			Status:    "error",
	 			ErrorCode: codes.UNAUTHORIZED,
	 			Message:   "only users with the admin role may create a course",
	 		})
	 	return
	 }

	var course models.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		config.Log.Debugln("either incorrect JSON or mismatching attributes" + err.Error())
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_JSON,
				Message:   "either incorrect JSON or mismatching attributes: " + err.Error(),
			})
		return
	}

	// make sure the difficulty level is valid
	switch course.DifficultyLevel {
	case models.Beginner, models.Intermediate, models.Advanced, models.Expert:
		break
	default:
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_INPUT,
				Message:   "invalid difficulty level",
			})
		return
	}

	createdCourse, err := h.courseRepo.CreateCourse(ctx, &course)

	if err != nil {
		log.Printf("Error creating course: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "Could not create course",
			})
		return
	}

	RespondWithJSON(w, http.StatusCreated,
		models.Response{
			Status:  "success",
			Message: "Course created successfully",
			Data:    createdCourse,
		})
}

func (h *courseHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	 userID, ok := middleware.GetUserID(ctx)
	 if !ok {
	 	config.Log.Debugln("Unauthorized user tried to create course.")
	 	RespondWithJSON(w, http.StatusUnauthorized,
	 		models.Response{
	 			Status:    "error",
	 			ErrorCode: codes.UNAUTHORIZED,
	 			Message:   "Unauthorized",
	 		})
	 	return
	 }

	 // Only admin users can update courses
	 user, err := h.userRepo.GetUserByID(userID)
	 if err != nil || user.Role != "admin" {
	 	config.Log.Debugln("User without admin role tried to update a course.")
	 	RespondWithJSON(w, http.StatusForbidden,
	 		models.Response{
	 			Status:    "error",
	 			ErrorCode: codes.UNAUTHORIZED,
	 			Message:   "Only users with the admin role may update a course",
	 		})
	 	return
	 }

	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		config.Log.Debugf("Tried to update course but sent invalid course ID input")
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_INPUT,
				Message:   "Invalid course ID format",
			})
		return
	}

	_, err = h.courseRepo.GetCourseByID(ctx, id)
	if err != nil {
		config.Log.Debugf("Tried to update a course with an invalid course ID: %d\n", id)
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_INPUT,
				Message:   "Invalid course ID",
			})
		return
	}

	var course models.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		config.Log.Debugln("Either incorrect JSON or mismatching attributes")
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_JSON,
				Message:   "Either incorrect JSON or mismatching attributes",
			})
		return
	}
	course.ID = id

	createdCourse, err := h.courseRepo.UpdateCourse(ctx, &course)

	if err != nil {
		config.Log.Debugf("Error updating course: %v", err.Error())
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "Could not update course",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "Course updated successfully",
			Data:    createdCourse,
		})
}

func (h *courseHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	 userID, ok := middleware.GetUserID(ctx)
	 if !ok {
	 	config.Log.Debugln("Unauthorized user tried to delete a course.")
	 	RespondWithJSON(w, http.StatusUnauthorized,
	 		models.Response{
	 			Status:    "error",
	 			ErrorCode: codes.UNAUTHORIZED,
	 			Message:   "You are not authorized to delete a course",
	 		})
	 	return
	 }

	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: codes.INVALID_INPUT,
				Message:   "Invalid course ID in the route",
			})
		return
	}

	// Only admin users can update courses
	 user, err := h.userRepo.GetUserByID(userID)
	 if err != nil || user.Role != "admin" {
	 	config.Log.Debugln("User without admin role tried to delete a course.")
	 	RespondWithJSON(w, http.StatusForbidden,
	 		models.Response{
	 			Status:    "error",
	 			ErrorCode: codes.UNAUTHORIZED,
	 			Message:   "Only users with the admin role may delete a course",
	 		})
	 	return
	 }

	if err := h.courseRepo.DeleteCourse(ctx, id); err != nil {
		config.Log.Debugf("Error deleting course %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{Status: "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "Failed to delete the course from the database",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "Course deleted successfully",
		})
}

// ****************
// **** UNITS ****
// ****************

func (h *courseHandler) GetAllUnits(w http.ResponseWriter, r *http.Request) {
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

	units, err := h.courseRepo.GetAllUnits(ctx, courseID)
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

func (h *courseHandler) GetUnitByID(w http.ResponseWriter, r *http.Request) {
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

	unit, err := h.courseRepo.GetUnitByID(ctx, id)
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

func (h *courseHandler) CreateUnit(w http.ResponseWriter, r *http.Request) {
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

	newUnit, err := h.courseRepo.CreateUnit(ctx, &unit)
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

func (h *courseHandler) UpdateUnit(w http.ResponseWriter, r *http.Request) {
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

	newUnit, err := h.courseRepo.UpdateUnit(ctx, &unit)
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

func (h *courseHandler) DeleteUnit(w http.ResponseWriter, r *http.Request) {
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

	db := config.GetDB()
	repo := repository.NewCourseRepository(db)
	if err := repo.DeleteUnit(ctx, unitID); err != nil {
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

func (h *courseHandler) GetAllModulesPartial(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid unit ID",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	modules, err := h.courseRepo.GetAllModulesPartial(ctx, unitID)
	if err != nil {
		log.Printf("Error fetching modules for unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve modules",
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Modules retrieved successfully",
		Data:    modules,
	})
}

func (h *courseHandler) GetAllModules(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid unit ID",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	modules, err := h.courseRepo.GetAllModules(ctx, unitID)
	if err != nil {
		log.Printf("Error fetching modules for unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve modules",
			ErrorCode: codes.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Modules retrieved successfully",
		Data:    modules,
	})
}

func (h *courseHandler) GetModuleByModuleID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["units"], 10, 64)
	moduleID, err := strconv.ParseInt(params["modules"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID",
			ErrorCode: codes.INVALID_REQUEST,
		})
		return
	}

	module, err := h.courseRepo.GetModuleByModuleID(ctx, unitID, moduleID)
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

func (h *courseHandler) CreateModule(w http.ResponseWriter, r *http.Request) {
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
	courseID, courseIDerr := strconv.ParseInt(params["course_id"], 10, 64)
	unitID, unitIDerr := strconv.ParseInt(params["unit_id"], 10, 64)
	if courseIDerr != nil || unitIDerr != nil {
		config.Log.Debug("Incorrect course or unit ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			ErrorCode: codes.INVALID_REQUEST,
			Message:   "Incorrect course or unit ID format in the route",
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
	module.CourseID = courseID
	module.UnitID = unitID

	if err := h.courseRepo.CreateModule(ctx, &module); err != nil {
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

func (h *courseHandler) UpdateModule(w http.ResponseWriter, r *http.Request) {
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

	_, err = h.courseRepo.GetModuleByModuleID(ctx, unitID, moduleID)
	if err != nil {
		log.Printf("Error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:    "error",
			Message:   "Module not found",
			ErrorCode: codes.NO_DATA,
		})
		return
	}

	if err := h.courseRepo.UpdateModule(ctx, &module); err != nil {
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

func (h *courseHandler) DeleteModule(w http.ResponseWriter, r *http.Request) {
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

	_, err = h.courseRepo.GetModuleByModuleID(ctx, unitID, moduleID)
	if err != nil {
		log.Printf("Error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:    "error",
			Message:   "Module not found",
			ErrorCode: codes.NO_DATA,
		})
		return
	}

	if err := h.courseRepo.DeleteModule(ctx, moduleID); err != nil {
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

func (h *courseHandler) GetAllModuleQuestions(w http.ResponseWriter, r *http.Request) {
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

func (h *courseHandler) CreateModuleQuestion(w http.ResponseWriter, r *http.Request) {
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

func (h *courseHandler) UpdateModuleQuestion(w http.ResponseWriter, r *http.Request) {
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

func (h *courseHandler) DeleteModuleQuestion(w http.ResponseWriter, r *http.Request) {
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
