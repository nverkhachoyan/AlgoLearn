package handlers

import (
	httperr "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CourseHandler interface {
	ListCourses(c *gin.Context)
	GetCourse(c *gin.Context)
	ListCoursesProgress(c *gin.Context)
	GetCourseProgress(c *gin.Context)
	StartCourse(c *gin.Context)
	DeleteCourse(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
	RestartCourse(c *gin.Context)
}

type courseHandler struct {
	courseRepo service.CourseService
	userRepo   service.UserService
	log        *logger.Logger
}

func NewCourseHandler(courseRepo service.CourseService,
	userRepo service.UserService) CourseHandler {
	return &courseHandler{
		courseRepo: courseRepo,
		userRepo:   userRepo,
		log:        logger.Get(),
	}
}

// ListCourses handles GET /courses
// Returns a paginated list of all available courses
func (h *courseHandler) ListCourses(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "ListCourses")
	ctx := c.Request.Context()

	page, err := strconv.ParseInt(c.Query("page"), 10, 64)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid page number: must be a positive integer",
		})
		return
	}

	pageSize, err := strconv.ParseInt(c.Query("pageSize"), 10, 64)
	if err != nil || pageSize < 1 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid page size: must be a positive integer",
		})
		return
	}

	totalCount, courses, err := h.courseRepo.ListCourses(ctx, int(page), int(pageSize))
	if err != nil {
		log.WithError(err).Error("error fetching courses")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving courses",
		})
		return
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "courses retrieved successfully",
		Payload: models.PaginatedPayload{
			Items: courses,
			Pagination: models.Pagination{
				TotalItems:  totalCount,
				PageSize:    int(pageSize),
				CurrentPage: int(page),
				TotalPages:  int(totalPages),
			},
		},
	})
}

// GetCourse handles GET /courses/:courseId
// Returns details of a specific course
func (h *courseHandler) GetCourse(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetCourse")
	ctx := c.Request.Context()

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil || courseID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course ID: must be a positive integer",
		})
		return
	}

	course, err := h.courseRepo.GetCourse(ctx, courseID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "course not found",
			})
			return
		}
		log.WithError(err).Error("error fetching course")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving course",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course retrieved successfully",
		Payload: course,
	})
}

// ListCoursesProgress handles GET /courses/progress
// Returns a paginated list of courses with user's progress
func (h *courseHandler) ListCoursesProgress(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "ListCoursesProgress")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		log.Debug("unauthorized user tried to get courses progress")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to access course progress",
		})
		return
	}

	page, err := strconv.ParseInt(c.Query("page"), 10, 64)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid page number: must be a positive integer",
		})
		return
	}

	pageSize, err := strconv.ParseInt(c.Query("pageSize"), 10, 64)
	if err != nil || pageSize < 1 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid page size: must be a positive integer",
		})
		return
	}

	totalCount, courses, err := h.courseRepo.ListCoursesProgress(ctx, int(page), int(pageSize), int64(userID))
	if err != nil {
		log.WithError(err).Error("error fetching courses progress")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving courses progress",
		})
		return
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "courses progress retrieved successfully",
		Payload: models.PaginatedPayload{
			Items: courses,
			Pagination: models.Pagination{
				TotalItems:  totalCount,
				PageSize:    int(pageSize),
				CurrentPage: int(page),
				TotalPages:  int(totalPages),
			},
		},
	})
}

// GetCourseProgress handles GET /courses/:courseId/progress
// Returns details of a specific course with user's progress
func (h *courseHandler) GetCourseProgress(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetCourseProgress")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		log.Debug("unauthorized user tried to get course progress")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to access course progress",
		})
		return
	}

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil || courseID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course ID: must be a positive integer",
		})
		return
	}

	course, err := h.courseRepo.GetCourseProgress(ctx, int64(userID), courseID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "course not found",
			})
			return
		}
		log.WithError(err).Error("error fetching course progress")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving course progress",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course progress retrieved successfully",
		Payload: course,
	})
}

func (h *courseHandler) StartCourse(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "StartCourse")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		log.Debug("unauthorized user tried to start a course")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to start a course",
		})
		return
	}

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 32)
	if err != nil || courseID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course ID: must be a positive integer",
		})
		return
	}

	unitID, moduleID, err := h.courseRepo.StartCourse(ctx, int64(userID), int32(courseID))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "course not found",
			})
			return
		}
		log.WithError(err).Error("error starting course")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while starting the course",
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "course started successfully",
		Payload: models.StartCourseResponse{
			UnitID:   unitID,
			ModuleID: moduleID,
		},
	})
}

func (h *courseHandler) DeleteCourse(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "DeleteCourse")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		log.Debug("unauthorized user tried to delete a course")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to delete a course",
		})
		return
	}

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil || courseID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course ID: must be a positive integer",
		})
		return
	}

	// Only admin users can delete courses
	user, err := h.userRepo.GetUserByID(ctx, int32(userID))
	if err != nil {
		log.WithError(err).Error("error fetching user data")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while verifying user permissions",
		})
		return
	}

	if user.Role != "admin" {
		log.Debug("non-admin user tried to delete a course")
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			ErrorCode: httperr.Forbidden,
			Message:   "only administrators can delete courses",
		})
		return
	}

	err = h.courseRepo.DeleteCourse(ctx, courseID)
	if err != nil {
		if errors.Is(err, httperr.ErrNotFound) {
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "course not found",
			})
			return
		}
		log.WithError(err).Error("error deleting course")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while deleting the course",
		})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (h *courseHandler) RestartCourse(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "RestartCourse")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to restart a course",
		})
		return
	}

	courseID, err := strconv.Atoi(c.Param("courseId"))
	if err != nil || courseID <= 0 {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidFormData,
			Message:   "invalid course ID: must be a positive integer",
		})
		return
	}

	err = h.courseRepo.DeleteCourseProgress(ctx, int64(userID), int64(courseID))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "course not found or no progress exists",
			})
			return
		}
		log.WithError(err).Error("failed to delete course progress")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while restarting the course",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course progress reset successfully",
	})
}

func (h *courseHandler) RegisterRoutes(r *gin.RouterGroup) {
	courses := r.Group("/courses")

	// Public routes
	{
		courses.GET("", h.ListCourses)         // GET /courses
		courses.GET("/:courseId", h.GetCourse) // GET /courses/:courseId
	}

	// Protected routes
	authorized := courses.Group("", middleware.Auth())
	{
		authorized.GET("/progress", h.ListCoursesProgress)         // GET /courses/progress
		authorized.GET("/:courseId/progress", h.GetCourseProgress) // GET /courses/:courseId/progress
		authorized.POST("/:courseId/start", h.StartCourse)         // POST /courses/:courseId/start
		authorized.POST("/:courseId/restart", h.RestartCourse)     // POST /courses/:courseId/restart
		authorized.DELETE("/:courseId", h.DeleteCourse)            // DELETE /courses/:courseId
	}
}
