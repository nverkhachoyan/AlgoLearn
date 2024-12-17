package handlers

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CourseHandler interface {
	GetCourses(c *gin.Context)
	GetCourse(c *gin.Context)
	DeleteCourse(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
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

func (h *courseHandler) GetCourses(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetCourses")
	queryParams := models.ModuleQueryParams{
		Type: c.Query("type"),
	}

	switch queryParams.Type {
	case "summary":
		h.getCoursesProgressSummary(c)
	case "full":
		log.Warn("full queries of courses not supported")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "full queries of courses not supported",
			ErrorCode: codes.InvalidRequest,
		})
	default:
		log.Warn("possibly incorrect or missing query parameters")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			Message:   "possibly incorrect or missing query parameters",
			ErrorCode: codes.InvalidRequest,
		})
	}
}

func (h *courseHandler) GetCourse(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetCourse")
	ctx := c.Request.Context()

	queryParams := models.ModuleQueryParams{
		Type:   c.Query("type"),
		Filter: c.Query("filter"),
	}

	userID, err := strconv.ParseInt(c.Query("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidInput,
			Message:   "invalid user ID in query parameters",
		})
		return
	}

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidInput,
			Message:   "invalid course ID in path parameter",
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
	case "full":
		if queryParams.Filter == "learning" {
			course, err = h.courseRepo.GetCourseProgressFull(ctx, userID, courseID)
		} else if queryParams.Filter == "explore" {
			course, err = h.courseRepo.GetCourseFull(ctx, courseID)
		}
	default:
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidRequest,
			Message:   "invalid type in the query parameter",
		})
		return
	}

	if err != nil {
		log.WithError(err).Error("error fetching courses progress")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: codes.DatabaseFail,
			Message:   "could not retrieve courses progress from the database",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course progress retrieved successfully",
		Payload: course,
	})
}

func (h *courseHandler) DeleteCourse(c *gin.Context) {
	log := h.log
	ctx := c.Request.Context()
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		log.Debug("unauthorized user tried to delete a course")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: codes.Unauthorized,
			Message:   "you are not authorized to delete a course",
		})
		return
	}

	id, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidInput,
			Message:   "invalid course ID in the route",
		})
		return
	}

	// Only admin users can update courses
	user, err := h.userRepo.GetUserByID(int32(userID.(int64)))
	if err != nil || user.Role != "admin" {
		log.Debug("User without admin role tried to delete a course")
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			ErrorCode: codes.Unauthorized,
			Message:   "Only users with the admin role may delete a course",
		})
		return
	}

	err = h.courseRepo.DeleteCourse(ctx, id)
	if errors.Is(err, codes.ErrNotFound) {
		log.Infof("attempt to delete course that does not exist %d: %v", id, err)
		c.JSON(http.StatusNotFound, models.Response{
			Success:   false,
			ErrorCode: codes.NoData,
			Message:   "course not found",
		})
		return
	} else if err != nil {
		log.Debugf("error deleting course %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: codes.DatabaseFail,
			Message:   "failed to delete the course from the database",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course deleted successfully",
	})
}

func (h *courseHandler) getCoursesProgressSummary(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetCoursesProgress")
	ctx := c.Request.Context()

	userID, err := strconv.ParseInt(c.Query("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidInput,
			Message:   "invalid user ID in query parameters",
		})
		return
	}

	page, err := strconv.ParseInt(c.Query("currentPage"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidInput,
			Message:   "invalid page number in query parameters",
		})
		return
	}

	pageSize, err := strconv.ParseInt(c.Query("pageSize"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: codes.InvalidInput,
			Message:   "invalid page size in query parameters",
		})
		return
	}

	totalCount, courses, err := h.courseRepo.GetCoursesProgressSummary(ctx, int(page), int(pageSize), userID, c.Query("filter"))
	if err != nil {
		log.WithError(err).Error("error fetching courses progress")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: codes.DatabaseFail,
			Message:   "could not retrieve courses progress from the database",
		})
		return
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	if len(courses) == 0 {
		c.JSON(http.StatusOK, models.Response{
			Success: true,
			Message: "no courses in progress",
			Payload: models.PaginatedPayload{
				Items: []models.Course{},
				Pagination: models.Pagination{
					TotalItems:  0,
					PageSize:    0,
					CurrentPage: 0,
					TotalPages:  0,
				},
			},
		})
		return
	}

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

func (h *courseHandler) RegisterRoutes(r *gin.RouterGroup) {
	// Public routes
	courses := r.Group("/courses")
	courses.GET("", h.GetCourses)
	courses.GET("/:courseId", h.GetCourse)

	// Protected routes (require authentication)
	authorized := courses.Group("", middleware.Auth())
	// authorized.POST("", h.CreateCourse)
	// authorized.PUT("/:courseId", h.UpdateCourse)
	authorized.DELETE("/:courseId", h.DeleteCourse)
	// authorized.POST("/:courseId/progress", h.UpdateCourseProgress)
	// authorized.GET("/:courseId/progress", h.GetCourseProgress)
}
