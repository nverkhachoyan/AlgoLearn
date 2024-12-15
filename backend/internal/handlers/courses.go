package handlers

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/repository"
	"algolearn/internal/router"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"

	"errors"
	"net/http"
	"strconv"

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

func (h *courseHandler) GetCourses(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCourses")
	query := r.URL.Query()

	queryParams := models.ModuleQueryParams {
		Type: query.Get("type"),
	}

	switch queryParams.Type {
	case "summary":
			h.getCoursesProgressSummary(w, r)
		break
	case "full":
		log.Warn("full queries of courses not supported")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success: false,
			Message: "full queries of courses not supported",
			ErrorCode: codes.InvalidRequest,
		})
		break
	default:
		log.Warn("possibly incorrect or missing query parameters")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Success: false,
			Message: "possibly incorrect or missing query parameters",
			ErrorCode: codes.InvalidRequest,
		})
	}
}

func (h *courseHandler) GetCourse(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCourse")
	ctx := r.Context()
	query := r.URL.Query()
	params := mux.Vars(r)

	queryParams := models.ModuleQueryParams {
		Type: query.Get("type"),
		Filter: query.Get("filter"),
	}

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

	log.Infof("Handler called with type %s", queryParams.Type)

	var course *models.Course
	switch queryParams.Type {
	case "summary":
		if queryParams.Filter == "learning" {
			course, err = h.courseRepo.GetCourseProgressSummary(ctx, userID, courseID)
		} else if queryParams.Filter == "explore" {
			course, err = h.courseRepo.GetCourseSummary(ctx, courseID)
		}
		break
	case "full":
		if queryParams.Filter == "learning" {
			course, err = h.courseRepo.GetCourseProgressFull(ctx, userID, courseID)
		} else if queryParams.Filter == "explore" {
			//TODO: use actual repo func
			course, err = h.courseRepo.GetCourseFull(ctx, courseID)
		}
		break
	default:
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidRequest,
				Message:   "invalid type in the query parameter",
			})
	}

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

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success: true,
			Message: "course progress retrieved successfully",
			Data:    course,
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

func (h *courseHandler) RegisterRoutes(r *router.Router) {
	// Route groups
	public := r.Group("/courses")
	authorized := r.Group("/courses", middleware.Auth)
	
	// Public routes
	public.Handle("", h.GetCourses, "GET")
	public.Handle("/{courseId}", h.GetCourse, "GET")

	// Authorized routes
	authorized.Handle("/{courseId}", h.DeleteCourse, "DELETE")
}
