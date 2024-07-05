// internal/handlers/courses.go
package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := repository.GetAllCourses()
	if err != nil {
		log.Printf("Error fetching courses: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve courses"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Courses retrieved successfully", Data: courses})
}

func GetCourseByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid course ID"})
		return
	}

	course, err := repository.GetCourseByID(id)
	if err != nil {
		log.Printf("Error fetching course %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve course"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Course retrieved successfully", Data: course})
}

func CreateCourse(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can create courses
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	var course models.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	if err := repository.CreateCourse(&course); err != nil {
		log.Printf("Error creating course: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create course"})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{Status: "success", Message: "Course created successfully", Data: course})
}

func UpdateCourse(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can update courses
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid course ID"})
		return
	}

	var course models.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}
	course.ID = id

	if err := repository.UpdateCourse(&course); err != nil {
		log.Printf("Error updating course %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not update course"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Course updated successfully"})
}

func DeleteCourse(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can delete courses
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid course ID"})
		return
	}

	if err := repository.DeleteCourse(id); err != nil {
		log.Printf("Error deleting course %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not delete course"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Course deleted successfully"})
}
