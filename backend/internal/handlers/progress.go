package handlers

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/repository"
	"algolearn/internal/router"
	"algolearn/pkg/logger"

	"net/http"

	"strconv"
)

type ProgressHandler interface {
	GetCoursesProgress(w http.ResponseWriter, r *http.Request)
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

	totalCount, courses, err := h.progressRepo.GetCoursesProgress(ctx, int(page), int(pageSize), userID)
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

func (h *progressHandler) RegisterRoutes(r *router.Router) {
	// Route groups
	public := r.Group("/progress")
	// authorized := r.Group("/progress", middleware.Auth)

	// Public routes
	public.Handle("", h.GetCoursesProgress, "GET")
	// public.Handle("/{course_id}", h.GetCourseByID, "GET")

	// Authorized routes
	// authorized.Handle("", h.CreateCourse, "POST")
	// authorized.Handle("/{course_id}", h.UpdateCourse, "PUT")
	// authorized.Handle("/{course_id}", h.DeleteCourse, "DELETE")
}
