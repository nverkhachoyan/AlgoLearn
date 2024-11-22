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
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

var (
	maxExpansionDepth  = 3
	validRelationships = map[string]bool{
		"units":     true,
		"modules":   true,
		"questions": true,
	}
)

type CourseHandler interface {
	GetCourses(w http.ResponseWriter, r *http.Request)
	GetCourse(w http.ResponseWriter, r *http.Request)
	CreateCourse(w http.ResponseWriter, r *http.Request)
	UpdateCourse(w http.ResponseWriter, r *http.Request)
	DeleteCourse(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
	GetCoursesProgress(w http.ResponseWriter, r *http.Request)
	GetCourseProgress(w http.ResponseWriter, r *http.Request)
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

func (h *courseHandler) GetCourses(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCourses")
	query := r.URL.Query()

	queryParams := models.ModuleQueryParams {
		Type: query.Get("type"),
		Include: query.Get("include"),
	}

	if queryParams.Type == "summary" && queryParams.Include == "progress" {
		h.getCoursesProgressSummary(w, r)
		return
	}

	log.Warn("possibly incorrect or missing query parameters")
	RespondWithJSON(w, http.StatusBadRequest, models.Response{
		Success: false,
		Message: "possibly incorrect or missing query parameters",
		ErrorCode: codes.InvalidRequest,
	})
}

func (h *courseHandler) GetCourse(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCourseProgress")
	ctx := r.Context()
	query := r.URL.Query()
	params := mux.Vars(r)

	userID, err := strconv.ParseInt(query.Get("userId"), 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get user id from query parameters",
			})
		return
	}

	courseID, err := strconv.ParseInt(params["courseId"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get course id from query parameters",
			})
		return
	}

	queryType := query.Get("type")
	log.Infof("Handler called with type %s", queryType)

	var course *models.Course
	switch queryType {
	case "summary":
		course, err = h.courseRepo.GetCourseProgressSummary(ctx, userID, courseID)
		if err != nil {
			log.WithError(err).Error("error fetching courses progress")
	
			RespondWithJSON(w, http.StatusInternalServerError,
				models.Response{
					Success:   false,
					ErrorCode: codes.DatabaseFail,
					Message:   "could not retrieve courses progress from the database",
				})
			return
		}
	case "full":
		course, err = h.courseRepo.GetCourseProgressFull(ctx, userID, courseID)
		if err != nil {
			log.WithError(err).Error("error fetching courses progress")
	
			RespondWithJSON(w, http.StatusInternalServerError,
				models.Response{
					Success:   false,
					ErrorCode: codes.DatabaseFail,
					Message:   "could not retrieve courses progress from the database",
				})
			return
		}
	default:
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidRequest,
				Message:   "invalid type in the query parameter",
			})
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
			Message: "course progress retrieved successfully",
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
				Success:   false,
				ErrorCode: codes.Unauthorized,
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
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get user by ID from database",
			})
		return
	}

	if user.Role != "admin" {
		log.Debugln("user without admin role tried to create course")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "only users with the admin role may create a course",
			})
		return
	}

	var course models.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		log.Debugln("either incorrect JSON or mismatching attributes" + err.Error())
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidJson,
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
				Success:   false,
				ErrorCode: codes.InvalidInput,
				Message:   "invalid difficulty level",
			})
		return
	}

	createdCourse, err := h.courseRepo.CreateCourse(ctx, &course)

	if err != nil {
		log.Errorf("error creating course: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "could not create course",
			})
		return
	}

	RespondWithJSON(w, http.StatusCreated,
		models.Response{
			Success: true,
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
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "unauthorized",
			})
		return
	}

	// Only admin users can update courses
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		log.Debugln("user without admin role tried to update a course.")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "only users with the admin role may update a course",
			})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["id"], 10, 64)
	if err != nil {
		log.Debugf("Tried to update course but sent invalid course ID input")
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidInput,
				Message:   "Invalid course ID format",
			})
		return
	}

	_, err = h.courseRepo.GetCourseByID(ctx, []string{""}, id)
	if errors.Is(err, codes.ErrNotFound) {
		log.Debugf("course not found: %d\n", id)
		RespondWithJSON(w, http.StatusNotFound,
			models.Response{
				Success:   false,
				ErrorCode: codes.NoData,
				Message:   "course not found",
			})
		return
	} else if err != nil {
		log.Errorln(err.Error())
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   err.Error(),
			})
		return
	}

	var course models.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		log.Debugln("Either incorrect JSON or mismatching attributes")
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidJson,
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
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to update course",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
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
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "you are not authorized to delete a course",
			})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.ParseInt(params["courseId"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidInput,
				Message:   "invalid course ID in the route",
			})
		return
	}

	// Only admin users can update courses
	user, err := h.userRepo.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		log.Debugln("User without admin role tried to delete a course.")
		RespondWithJSON(w, http.StatusForbidden,
			models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "Only users with the admin role may delete a course",
			})
		return
	}

	err = h.courseRepo.DeleteCourse(ctx, id)
	if errors.Is(err, codes.ErrNotFound) {
		log.Infof("attempt to delete course that does not exist %d: %v", id, err)
		RespondWithJSON(w, http.StatusNotFound,
			models.Response{Success: false,
				ErrorCode: codes.NoData,
				Message:   "course not found",
			})
		return
	} else if err != nil {
		log.Debugf("error deleting course %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{Success: false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to delete the course from the database",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
			Message: "course deleted successfully",
		})
}

func (h *courseHandler) validateExpansion(expandParam string) ([]string, error) {
	if expandParam == "" {
		return nil, nil
	}

	relationships := strings.Split(expandParam, ".")

	if len(relationships) > maxExpansionDepth {
		return nil, fmt.Errorf("max expansion depth exceeded (max %d)", maxExpansionDepth)
	}

	validatedExpansions := make([]string, 0, len(relationships))
	for _, expansion := range relationships {
		expansion = strings.TrimSpace(expansion)
		if expansion == "" {
			continue
		}

		if !validRelationships[expansion] {
			return nil, fmt.Errorf("invalid include parameter: %s", expansion)
		}

		parts := strings.Split(expansion, ".")
		for i, part := range parts {
			if !validRelationships[part] {
				return nil, fmt.Errorf("invalid nested expansion: %s", part)
			}
			if i > 0 && !h.isValidNesting(parts[i-1], part) {
				return nil, fmt.Errorf("invalid nesting: %s cannot be nested under %s", part, parts[i-1])
			}
		}

		validatedExpansions = append(validatedExpansions, expansion)
	}

	return validatedExpansions, nil
}

func (h *courseHandler) isValidNesting(parent, child string) bool {
	switch parent {
	case "units":
		return child == "modules"
	case "modules":
		return child == "questions"
	default:
		return false
	}
}

// *********
// WITH PROGRESS
// *********

func (h *courseHandler) GetCoursesProgress(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCoursesProgress")
	query := r.URL.Query()

	queryType := query.Get("type")
	log.Infof("Handler called with type %s", queryType)

	switch queryType {
	case "summary":
		h.getCoursesProgressSummary(w, r)
	default:
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidRequest,
				Message:   "invalid type in the query parameter",
			})
	}
}

func (h *courseHandler) getCoursesProgressSummary(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCoursesProgress")
	ctx := r.Context()
	query := r.URL.Query()
	userID, err := strconv.ParseInt(query.Get("userId"), 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get user id from query parameters",
			})
		return
	}

	page, err := strconv.ParseInt(query.Get("currentPage"), 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get page from query parameters",
			})
		return
	}

	pageSize, err := strconv.ParseInt(query.Get("pageSize"), 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get page size from query parameters",
			})
		return
	}

	queryFilter := query.Get("filter")

	totalCount, courses, err := h.courseRepo.GetCoursesProgressSummary(ctx, int(page), int(pageSize), userID, queryFilter)
	if err != nil {
		log.WithError(err).Error("error fetching courses progress")

		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "could not retrieve courses progress from the database",
			})
		return
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
			Message: "courses progress retrieved successfully",
			Data: models.PaginatedPayload{
				Items:      courses,
				Pagination: models.Pagination{
					TotalItems:      totalCount,
					PageSize:   int(pageSize),
					CurrentPage:       int(page),
					TotalPages: int(totalPages),
				},
			},
		})
}

func (h *courseHandler) GetCourseProgress(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCourseProgress")
	ctx := r.Context()
	query := r.URL.Query()
	params := mux.Vars(r)

	userID, err := strconv.ParseInt(query.Get("userId"), 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get user id from query parameters",
			})
		return
	}

	courseID, err := strconv.ParseInt(params["courseId"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get course id from query parameters",
			})
		return
	}

	queryType := query.Get("type")
	log.Infof("Handler called with type %s", queryType)

	var course *models.Course
	switch queryType {
	case "summary":
		course, err = h.courseRepo.GetCourseProgressSummary(ctx, userID, courseID)
		if err != nil {
			log.WithError(err).Error("error fetching courses progress")
	
			RespondWithJSON(w, http.StatusInternalServerError,
				models.Response{
					Success:   false,
					ErrorCode: codes.DatabaseFail,
					Message:   "could not retrieve courses progress from the database",
				})
			return
		}
	case "full":
		course, err = h.courseRepo.GetCourseProgressFull(ctx, userID, courseID)
		if err != nil {
			log.WithError(err).Error("error fetching courses progress")
	
			RespondWithJSON(w, http.StatusInternalServerError,
				models.Response{
					Success:   false,
					ErrorCode: codes.DatabaseFail,
					Message:   "could not retrieve courses progress from the database",
				})
			return
		}
	default:
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidRequest,
				Message:   "invalid type in the query parameter",
			})
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
			Message: "course progress retrieved successfully",
			Data:    course,
		})
}

func (h *courseHandler) RegisterRoutes(r *router.Router) {
	// Route groups
	public := r.Group("/courses")
	authorized := r.Group("/courses", middleware.Auth)
	

	// Public routes
	public.Handle("", h.GetCourses, "GET")
	public.Handle("/{courseId}", h.GetCourse, "GET")

	// Authorized routes
	authorized.Handle("", h.CreateCourse, "POST")
	authorized.Handle("/{courseId}", h.UpdateCourse, "PUT")
	authorized.Handle("/{courseId}", h.DeleteCourse, "DELETE")

	// **************
	// WITH PROGRESS
	// **************

	progressPublic := r.Group("/progress/courses")
	// authorized := r.Group("/progress", middleware.Auth)

	// Public routes
	progressPublic.Handle("", h.GetCoursesProgress, "GET")
	progressPublic.Handle("/{courseId}", h.GetCourseProgress, "GET")
}
