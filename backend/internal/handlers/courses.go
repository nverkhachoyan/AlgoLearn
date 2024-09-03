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

func GetAllCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := repository.GetAllCourses()
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

func GetCourseByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
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

	course, err := repository.GetCourseByID(id)
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

func CreateCourse(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		config.Log.Debugln("Unauthorized user tried to create course.")
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Unauthorized",
			})
		return
	}

	// Only admin users can create courses
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		config.Log.Debugf("UserID: %d\n", userID)
		config.Log.Debugf("User without admin role tried to create course: Detailed Error: %v", err)
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Only users with the admin role may create a course",
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

	if err := repository.CreateCourse(&course); err != nil {
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
			Data:    course,
		})
}

func UpdateCourse(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		config.Log.Debugln("Unauthorized user tried to create course.")
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Unauthorized",
			})
		return
	}

	// Only admin users can update courses
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		config.Log.Debugln("User without admin role tried to update a course.")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Only users with the admin role may update a course",
			})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
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

	_, err = repository.GetCourseByID(id)
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

	if err := repository.UpdateCourse(&course); err != nil {
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
		})
}

func DeleteCourse(w http.ResponseWriter, r *http.Request) {
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
	id, err := strconv.Atoi(params["id"])
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

	if err := repository.DeleteCourse(id); err != nil {
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

func GetAllUnits(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	courseID, err := strconv.Atoi(params["course_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_INPUT,
				Message:   "Invalid course ID format",
			})
		return
	}

	units, err := repository.GetAllUnits(courseID)
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

func GetUnitByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_INPUT,
				Message:   "Invalid unit ID",
			})
		return
	}

	unit, err := repository.GetUnitByID(id)
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

func CreateUnit(w http.ResponseWriter, r *http.Request) {
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
	courseID, err := strconv.Atoi(params["course_id"])
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

	if err := repository.CreateUnit(&unit); err != nil {
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

func UpdateUnit(w http.ResponseWriter, r *http.Request) {
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
	unitID, err := strconv.Atoi(params["unit_id"])
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

	if err := repository.UpdateUnit(&unit); err != nil {
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

func DeleteUnit(w http.ResponseWriter, r *http.Request) {
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
	unitID, err := strconv.Atoi(params["unit_id"])
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

	if err := repository.DeleteUnit(unitID); err != nil {
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
