package handlers

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/repository"
	"algolearn/internal/router"
	"algolearn/pkg/logger"

	"github.com/gorilla/mux"

	"net/http"

	"strconv"
)

type ProgressHandler interface {
	GetCoursesProgress(w http.ResponseWriter, r *http.Request)
	GetCourseProgress(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
}

type progressHandler struct {
	progressRepo repository.ProgressRepository
	userRepo     repository.UserRepository
}

func NewProgressHandler(progressRepo repository.ProgressRepository,
	userRepo repository.UserRepository) ProgressHandler {
	return &progressHandler{
		progressRepo: progressRepo,
		userRepo:     userRepo,
	}
}

func (h *progressHandler) GetCoursesProgress(w http.ResponseWriter, r *http.Request) {
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

func (h *progressHandler) getCoursesProgressSummary(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCoursesProgress")
	ctx := r.Context()
	query := r.URL.Query()
	userID, err := strconv.ParseInt(query.Get("user_id"), 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get user id from query parameters",
			})
		return
	}

	page, err := strconv.ParseInt(query.Get("page"), 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get page from query parameters",
			})
		return
	}

	pageSize, err := strconv.ParseInt(query.Get("page_size"), 10, 64)
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

	totalCount, courses, err := h.progressRepo.GetCoursesProgressSummary(ctx, int(page), int(pageSize), userID, queryFilter)
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
			Data: models.PaginatedResponse{
				Items:      courses,
				Total:      totalCount,
				PageSize:   int(pageSize),
				Page:       int(page),
				TotalPages: int(totalPages),
			},
		})
}

func (h *progressHandler) GetCourseProgress(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCoursesProgress")
	query := r.URL.Query()

	queryType := query.Get("type")
	log.Infof("Handler called with type %s", queryType)

	switch queryType {
	case "summary":
		h.getCourseProgressSummary(w, r)
	default:
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: codes.InvalidRequest,
				Message:   "invalid type in the query parameter",
			})
	}
}

func (h *progressHandler) getCourseProgressSummary(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetCourseProgress")
	ctx := r.Context()
	query := r.URL.Query()
	params := mux.Vars(r)

	// TODO: Switch to using middleware to get userID
	userID, err := strconv.ParseInt(query.Get("user_id"), 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get user id from query parameters",
			})
		return
	}

	courseID, err := strconv.ParseInt(params["course_id"], 10, 64)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: codes.DatabaseFail,
				Message:   "failed to get course id from query parameters",
			})
		return
	}

	course, err := h.progressRepo.GetCourseProgressSummary(ctx, userID, courseID)
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

func (h *progressHandler) RegisterRoutes(r *router.Router) {
	// Route groups
	public := r.Group("/progress/courses")
	// authorized := r.Group("/progress", middleware.Auth)

	// Public routes
	public.Handle("", h.GetCoursesProgress, "GET")
	public.Handle("/{course_id}", h.GetCourseProgress, "GET")
	// public.Handle("/{course_id}", h.GetCourseByID, "GET")

	// Authorized routes
	// authorized.Handle("", h.CreateCourse, "POST")
	// authorized.Handle("/{course_id}", h.UpdateCourse, "PUT")
	// authorized.Handle("/{course_id}", h.DeleteCourse, "DELETE")
}
