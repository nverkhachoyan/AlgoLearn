// internal/handlers/courses.go
package handlers

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/errors"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// *****************
// **** COURSES ****
// *****************

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
	CreateModule(w http.ResponseWriter, r *http.Request)
	UpdateModule(w http.ResponseWriter, r *http.Request)
	DeleteModule(w http.ResponseWriter, r *http.Request)
}

type courseHandler struct {
	repo repository.CourseRepository
}

func NewCourseHandler(repo repository.CourseRepository) *courseHandler {
	return &courseHandler{repo: repo}
}

func (h *courseHandler) GetAllCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := h.repo.GetAllCourses()
	if err != nil {
		config.Log.Debugf("Error fetching courses: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
				Message:   "Could not retrieve courses from the database",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "Courses retrieved successfully",
			Data:    courses,
		})
}

func (h *courseHandler) GetCourseByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		config.Log.Debugf("Tried to retrieve a course with an invalid course ID: %d\n", id)
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_INPUT,
				Message:   "Invalid course ID",
			})
		return
	}

	course, err := h.repo.GetCourseByID(id)
	if err != nil {
		config.Log.Debugf("Error fetching course from database %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
				Message:   "Could not retrieve course from the database",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "Course retrieved successfully",
			Data:    course,
		})
}

func (h *courseHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	// userID, ok := middleware.GetUserID(r.Context())
	// if !ok {
	// 	config.Log.Debugln("Unauthorized user tried to create course.")
	// 	RespondWithJSON(w, http.StatusUnauthorized,
	// 		models.Response{
	// 			Status:    "error",
	// 			ErrorCode: errors.UNAUTHORIZED,
	// 			Message:   "Unauthorized",
	// 		})
	// 	return
	// }

	// Only admin users can create courses
	// user, err := repository.GetUserByID(userID)
	// if err != nil || user.Role != "admin" {
	// 	config.Log.Debugf("UserID: %d\n", userID)
	// 	config.Log.Debugf("User without admin role tried to create course: Detailed Error: %v", err)
	// 	RespondWithJSON(w, http.StatusForbidden,
	// 		models.Response{
	// 			Status:    "error",
	// 			ErrorCode: errors.UNAUTHORIZED,
	// 			Message:   "Only users with the admin role may create a course",
	// 		})
	// 	return
	// }

	var course models.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		config.Log.Debugln("Either incorrect JSON or mismatching attributes")
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_JSON,
				Message:   "Either incorrect JSON or mismatching attributes",
			})
		return
	}

	createdCourse, err := h.repo.CreateCourse(&course)

	if err != nil {
		log.Printf("Error creating course: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
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
	// userID, ok := middleware.GetUserID(r.Context())
	// if !ok {
	// 	config.Log.Debugln("Unauthorized user tried to create course.")
	// 	RespondWithJSON(w, http.StatusUnauthorized,
	// 		models.Response{
	// 			Status:    "error",
	// 			ErrorCode: errors.UNAUTHORIZED,
	// 			Message:   "Unauthorized",
	// 		})
	// 	return
	// }

	// // Only admin users can update courses
	// user, err := repository.GetUserByID(userID)
	// if err != nil || user.Role != "admin" {
	// 	config.Log.Debugln("User without admin role tried to update a course.")
	// 	RespondWithJSON(w, http.StatusForbidden,
	// 		models.Response{
	// 			Status:    "error",
	// 			ErrorCode: errors.UNAUTHORIZED,
	// 			Message:   "Only users with the admin role may update a course",
	// 		})
	// 	return
	// }

	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		config.Log.Debugf("Tried to update course but sent invalid course ID input")
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_INPUT,
				Message:   "Invalid course ID format",
			})
		return
	}

	_, err = h.repo.GetCourseByID(id)
	if err != nil {
		config.Log.Debugf("Tried to update a course with an invalid course ID: %d\n", id)
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_INPUT,
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
				ErrorCode: errors.INVALID_JSON,
				Message:   "Either incorrect JSON or mismatching attributes",
			})
		return
	}
	course.ID = id

	createdCourse, err := h.repo.UpdateCourse(&course)

	if err != nil {
		config.Log.Debugf("Error updating course: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
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
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		config.Log.Debugln("Unauthorized user tried to delete a course.")
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
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
				ErrorCode: errors.INVALID_INPUT,
				Message:   "Invalid course ID in the route",
			})
		return
	}

	// Only admin users can update courses
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		config.Log.Debugln("User without admin role tried to delete a course.")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Only users with the admin role may delete a course",
			})
		return
	}

	if err := h.repo.DeleteCourse(id); err != nil {
		config.Log.Debugf("Error deleting course %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{Status: "error",
				ErrorCode: errors.DATABASE_FAIL,
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
	params := mux.Vars(r)
	courseID, err := strconv.ParseInt(params["course_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_INPUT,
				Message:   "Invalid course ID format",
			})
		return
	}

	units, err := h.repo.GetAllUnits(courseID)
	if err != nil {
		log.Printf("Error fetching units for course %d: %v", courseID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status: "error", ErrorCode: errors.DATABASE_FAIL,
				Message: "Could not retrieve units",
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
	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_INPUT,
				Message:   "Invalid unit ID",
			})
		return
	}

	unit, err := h.repo.GetUnitByID(id)
	if err != nil {
		log.Printf("Error fetching unit %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
				Message:   "Could not retrieve unit",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "Unit retrieved successfully",
			Data:    unit,
		})
}

func (h *courseHandler) CreateUnit(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Unauthorized",
			})
		return
	}

	// Only admin users can create units
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		config.Log.Debugf("User without admin role tried to create course unit: Detailed Error: %v", err)
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:  "error",
				Message: "Only users with the admin role may create course units",
			})
		return
	}

	params := mux.Vars(r)
	courseID, err := strconv.ParseInt(params["course_id"], 10, 64)
	if err != nil {
		config.Log.Debugln("Invalid format for course id in route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			ErrorCode: errors.INVALID_INPUT,
			Message:   "Invalid format for course id in route",
		})
	}

	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_JSON,
				Message:   "Invalid JSON or mismatching attributes",
			})
		return
	}
	unit.CourseID = courseID

	db := config.GetDB()
	repo := repository.NewCourseRepository(db)
	if err := repo.CreateUnit(&unit); err != nil {
		log.Printf("Error creating unit: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
				Message:   err.Error(),
			})
		return
	}

	RespondWithJSON(w, http.StatusCreated,
		models.Response{
			Status:  "success",
			Message: "Unit created successfully",
			Data:    unit,
		})
}

func (h *courseHandler) UpdateUnit(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "You are not authorized to make this request",
			})
		return
	}

	// Only admin users can update units
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		config.Log.Debugf("User without admin role tried to update course unit: Detailed Error: %v", err)
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Only users with admin role are allowed to update course units",
			})
		return
	}

	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_INPUT,
				Message:   "Invalid unit ID format",
			})
		return
	}

	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_JSON,
				Message:   "Invalid JSON or mismatching attributes"})
		return
	}
	unit.ID = unitID

	if err := h.repo.UpdateUnit(&unit); err != nil {
		log.Printf("Error updating unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
				Message:   err.Error(),
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "Unit updated successfully",
		})
}

func (h *courseHandler) DeleteUnit(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
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
				ErrorCode: errors.INVALID_INPUT,
				Message:   "Invalid unit ID format",
			})
		return
	}

	// Only admin users can delete units
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		config.Log.Debugf("User without admin role tried to delete course unit")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Only users with the admin role may delete a course unit",
			})
		return
	}

	db := config.GetDB()
	repo := repository.NewCourseRepository(db)
	if err := repo.DeleteUnit(unitID); err != nil {
		log.Printf("Error deleting unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
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
	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid unit ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	modules, err := h.repo.GetAllModulesPartial(unitID)
	if err != nil {
		log.Printf("Error fetching modules for unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve modules",
			ErrorCode: errors.DATABASE_FAIL,
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
	params := mux.Vars(r)
	unitID, err := strconv.ParseInt(params["unit_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid unit ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	modules, err := h.repo.GetAllModules(unitID)
	if err != nil {
		log.Printf("Error fetching modules for unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve modules",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Modules retrieved successfully",
		Data:    modules,
	})
}

func (h *courseHandler) GetModuleByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["module_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	module, err := h.repo.GetModuleByID(id)
	if err != nil {
		log.Printf("Error fetching module %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve module",
			ErrorCode: errors.DATABASE_FAIL,
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
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
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
			ErrorCode: errors.INVALID_REQUEST,
			Message:   "Incorrect course or unit ID format in the route",
		})
		return
	}

	// Only admin users can create modules
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(r.Body).Decode(&module); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   err.Error(),
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}

	// Setting course and unit IDs we got earlier from the route
	module.CourseID = courseID
	module.UnitID = unitID

	if err := h.repo.CreateModule(&module); err != nil {
		log.Printf("Error creating module: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to create the module in the database",
			ErrorCode: errors.DATABASE_FAIL,
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
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can update modules
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	moduleID, err := strconv.ParseInt(params["module_id"], 10, 64)
	if err != nil {
		config.Log.Debug("Invalid module ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID format in the route",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(r.Body).Decode(&module); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	module.ID = moduleID

	_, err = h.repo.GetModuleByID(moduleID)
	if err != nil {
		log.Printf("Error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:    "error",
			Message:   "Module not found",
			ErrorCode: errors.NO_DATA,
		})
		return
	}

	if err := h.repo.UpdateModule(&module); err != nil {
		log.Printf("Error updating module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to update module in the database",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Module updated successfully",
	})
}

func (h *courseHandler) DeleteModule(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	moduleID, err := strconv.ParseInt(params["module_id"], 10, 64)
	if err != nil {
		config.Log.Debug("Invalid module ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID format in the route",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	// Only admin users can delete modules
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	_, err = h.repo.GetModuleByID(moduleID)
	if err != nil {
		log.Printf("Error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:    "error",
			Message:   "Module not found",
			ErrorCode: errors.NO_DATA,
		})
		return
	}

	if err := h.repo.DeleteModule(moduleID); err != nil {
		log.Printf("Error deleting module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not delete module",
			ErrorCode: errors.DATABASE_FAIL,
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
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	questions, err := repository.GetQuestionsByModuleID(moduleID)
	if err != nil {
		config.Log.Debugf("Error fetching questions for module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to retrieve questions from database",
			ErrorCode: errors.DATABASE_FAIL,
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

func GetModuleQuestionByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["module_question_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid question ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	question, err := repository.GetQuestionByID(id)
	if err != nil {
		log.Printf("Error fetching question %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   err.Error(),
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Question retrieved successfully",
		Data:    question,
	})
}

func CreateModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	moduleID, err := strconv.Atoi(params["module_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID format",
			ErrorCode: errors.INVALID_REQUEST,
		})
	}

	// Only admin users can create questions
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	var question models.ModuleQuestion
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	question.ModuleID = moduleID

	if err := repository.CreateQuestion(&question); err != nil {
		log.Printf("Error creating question: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   err.Error(),
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{
		Status:  "success",
		Message: "Question created successfully",
		Data:    question,
	})
}

func UpdateModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
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
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	// Only admin users can update questions
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	var question models.ModuleQuestion
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
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
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Question updated successfully",
	})
}

func DeleteModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
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
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	// Only admin users can delete questions
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	if err := repository.DeleteQuestion(moduleID, moduleQuestionID); err != nil {
		log.Printf("Error deleting question %d: %v", moduleQuestionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   err.Error(),
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Question deleted successfully",
	})
}

// *********************************
// *** MODULE QUESTION ANSWERS HANDLERS ***
// *********************************

func GetAllModuleQuestionOptions(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	moduleQuestionID, err := strconv.Atoi(params["module_question_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid question ID format",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	answers, err := repository.GetOptionsByQuestionID(moduleQuestionID)
	if err != nil {
		log.Printf("Error fetching answers for question %d: %v", moduleQuestionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve answers",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	if len(answers) == 0 {
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:  "success",
			Message: "No answers found for the given question ID",
			Data:    []models.ModuleQuestionOption{},
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Answers retrieved successfully",
		Data:    answers,
	})
}

func GetModuleQuestionOptionByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["module_question_option_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid answer ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	answer, err := repository.GetModuleQuestionOptionByID(id)
	if err != nil {
		log.Printf("Error fetching answer %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve answer",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Answer retrieved successfully",
		Data:    answer,
	})
}

func CreateModuleQuestionOption(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	questionID, err := strconv.Atoi(params["module_question_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid question ID format",
			ErrorCode: errors.INVALID_REQUEST,
		})
	}

	// Only admin users can create answers
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	var answer models.ModuleQuestionOption
	if err := json.NewDecoder(r.Body).Decode(&answer); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid JSON input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	answer.QuestionID = questionID

	if err := repository.CreateModuleQuestionOption(&answer); err != nil {
		log.Printf("Error creating answer: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to create answer in the database",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{
		Status:  "success",
		Message: "Answer created successfully",
		Data:    answer,
	})
}

func UpdateModuleQuestionOption(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	answerID, err := strconv.ParseInt(params["module_question_option_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid answer ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	// Only admin users can update answers
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	var answer models.ModuleQuestionOption
	if err := json.NewDecoder(r.Body).Decode(&answer); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	answer.ID = answerID

	if err := repository.UpdateModuleQuestionOption(&answer); err != nil {
		log.Printf("Error updating answer %d: %v", answerID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not update answer",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Answer updated successfully",
	})
}

func DeleteModuleQuestionOption(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["module_question_option_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid answer ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	// Only admin users can delete answers
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	if err := repository.DeleteModuleQuestionOption(id); err != nil {
		log.Printf("Error deleting answer %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not delete answer",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Answer deleted successfully",
	})
}
