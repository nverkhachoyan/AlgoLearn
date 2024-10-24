package handlers

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/repository"
	"algolearn/internal/router"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"

	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type CourseHandler interface {
	GetAllCourses(w http.ResponseWriter, r *http.Request)
	GetCourseByID(w http.ResponseWriter, r *http.Request)
	CreateCourse(w http.ResponseWriter, r *http.Request)
	UpdateCourse(w http.ResponseWriter, r *http.Request)
	DeleteCourse(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
}

type courseHandler struct {
	courseRepo repository.CourseRepository
	userRepo   repository.UserRepository
}

func NewCourseHandler(courseRepo repository.CourseRepository,
	userRepo repository.UserRepository) CourseHandler {
	return &courseHandler{
		courseRepo: courseRepo,
		userRepo:   userRepo,
	}
}

func (h *courseHandler) GetAllCourses(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	ctx := r.Context()
	courses, err := h.courseRepo.GetAllCourses(ctx)

	if err != nil {
		log.WithFields(logger.Fields{
			"error": err.Error(),
		}).Error("error fetching courses")

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
	log := logger.Get()
	ctx := r.Context()
	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		log.WithFields(logger.Fields{
			"error": err.Error(),
		}).Errorf("tried to retrieve a course with an invalid course ID: %d\n", id)

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
		log.WithFields(logger.Fields{
			"error": err.Error(),
		}).Errorf("error fetching course from database %d: %v", id, err)

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
	log := logger.Get()
	ctx := r.Context()

	userID, ok := middleware.GetUserID(ctx)
	if !ok {
		log.Debug("unauthorized user tried to create course.")
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: codes.UNAUTHORIZED,
				Message:   "unauthorized",
			})
		return
	}

	// Only admin users can create courses
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		log.Debugf("failed to get user with user ID %d, %v\n", userID, err.Error())
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "failed to get user by ID from database",
			})
		return
	}

	if user.Role != "admin" {
		log.Debugln("user without admin role tried to create course")
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
		log.Debugln("either incorrect JSON or mismatching attributes" + err.Error())
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
		log.Errorf("error creating course: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "could not create course",
			})
		return
	}

	RespondWithJSON(w, http.StatusCreated,
		models.Response{
			Status:  "success",
			Message: "course created successfully",
			Data:    createdCourse,
		})
}

func (h *courseHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	ctx := r.Context()
	userID, ok := middleware.GetUserID(ctx)
	if !ok {
		log.Debugln("unauthorized user tried to create course.")
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
		log.Debugln("User without admin role tried to update a course.")
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
		log.Debugf("Tried to update course but sent invalid course ID input")
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
		log.Debugf("Tried to update a course with an invalid course ID: %d\n", id)
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
		log.Debugln("Either incorrect JSON or mismatching attributes")
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
		log.Debugf("Error updating course: %v", err.Error())
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: codes.DATABASE_FAIL,
				Message:   "could not update course",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:  "success",
			Message: "course updated successfully",
			Data:    createdCourse,
		})
}

func (h *courseHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	ctx := r.Context()
	userID, ok := middleware.GetUserID(ctx)
	if !ok {
		log.Debugln("unauthorized user tried to delete a course.")
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: codes.UNAUTHORIZED,
				Message:   "you are not authorized to delete a course",
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
		log.Debugln("User without admin role tried to delete a course.")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Status:    "error",
				ErrorCode: codes.UNAUTHORIZED,
				Message:   "Only users with the admin role may delete a course",
			})
		return
	}

	if err := h.courseRepo.DeleteCourse(ctx, id); err != nil {
		log.Debugf("Error deleting course %d: %v", id, err)
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

func (h *courseHandler) RegisterRoutes(r *router.Router) {
	// Create route groups
	public := r.Group("/courses")
	authorized := r.Group("/courses", middleware.Auth)

	// Public routes
	public.Handle("", h.GetAllCourses, "GET")
	public.Handle("/{id}", h.GetCourseByID, "GET")

	// Authorized routes
	authorized.Handle("", h.CreateCourse, "POST")
	authorized.Handle("/{id}", h.UpdateCourse, "PUT")
	authorized.Handle("/{id}", h.DeleteCourse, "DELETE")
}
