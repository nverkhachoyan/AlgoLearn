package handlers

import (
	httperr "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type CourseHandler interface {
	RegisterRoutes(r *gin.RouterGroup)
	ListAllCoursesWithOptionalProgress(c *gin.Context)
	CreateCourse(c *gin.Context)
	UpdateCourse(c *gin.Context)
	PublishCourse(c *gin.Context)
	GetCourse(c *gin.Context)
	SearchCourses(c *gin.Context)
	ListEnrolledCoursesWithProgress(c *gin.Context)
	GetCourseProgress(c *gin.Context)
	GetCoursesCount(c *gin.Context)
	StartCourse(c *gin.Context)
	ResetCourseProgress(c *gin.Context)
	DeleteCourse(c *gin.Context)
	GetCourseTags(c *gin.Context)
	SearchCourseTags(c *gin.Context)
	CreateCourseTag(c *gin.Context)
	InsertCourseTag(c *gin.Context)
	RemoveCourseTag(c *gin.Context)
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

func (h *courseHandler) ListAllCoursesWithOptionalProgress(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "ListCourses")
	ctx := c.Request.Context()

	sort, order := ParseSort(c)
	page, pageSize, offset, err := ParsePagination(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   err.Error(),
		})
		return
	}

	userID, err := GetUserID(c)
	if err != nil {
		log.Debug("unauthorized user tried to get courses")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to access courses",
		})
		return
	}

	_, courses, err := h.courseRepo.ListAllCoursesWithOptionalProgress(ctx, int64(userID), models.CourseQuery{
		Page:     int(offset),
		PageSize: int(pageSize),
		Sort:     sort,
		Order:    order,
	})
	if err != nil {
		log.WithError(err).Error("error fetching courses")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving courses",
		})
		return
	}

	totalCount, err := h.courseRepo.GetCoursesCount(ctx)
	if err != nil {
		log.WithError(err).Error("error fetching courses count")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving courses count",
		})
		return
	}

	SetContentRangeHeader(c, "courses", len(courses), page, pageSize, int(totalCount))

	totalPages := (int(totalCount) + pageSize - 1) / pageSize
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

func (h *courseHandler) CreateCourse(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "CreateCourse")
	ctx := c.Request.Context()

	userID, err := GetUserID(c)
	if err != nil {
		log.Debug("unauthorized user tried to create a course")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to create a course",
		})
		return
	}

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

	if user.Role != "instructor" && user.Role != "admin" {
		log.Debug("non-instructor user tried to create a course")
		c.JSON(http.StatusForbidden, models.Response{
			Success:   false,
			ErrorCode: httperr.Forbidden,
			Message:   "only instructors can create courses",
		})
		return
	}

	course := models.Course{}
	if err := c.ShouldBindJSON(&course); err != nil {
		log.WithError(err).Error("error binding course data")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course data",
		})
		return
	}

	fmt.Println("course UUID: ", course.FolderObjectKey)
	fmt.Println("course imgKey: ", course.ImgKey)

	createdCourse, err := h.courseRepo.CreateCourse(ctx, course)
	if err != nil {
		log.WithError(err).Error("error creating course")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while creating course",
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "course created successfully",
		Payload: createdCourse,
	})
}

func (h *courseHandler) UpdateCourse(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "UpdateCourse")
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

	course := models.Course{}
	if err := c.ShouldBindJSON(&course); err != nil {
		log.WithError(err).Error("error binding course data")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course data",
		})
		return
	}

	course.ID = courseID
	if err := h.courseRepo.UpdateCourse(ctx, course); err != nil {
		log.WithError(err).Error("error updating course")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while updating course",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course updated successfully",
	})
}

func (h *courseHandler) PublishCourse(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "PublishCourse")
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

	if err := h.courseRepo.PublishCourse(ctx, courseID); err != nil {
		log.WithError(err).Error("error publishing course")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while publishing course",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course published successfully",
	})
}

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

func (h *courseHandler) ListEnrolledCoursesWithProgress(c *gin.Context) {
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

	page, pageSize, offset, err := ParsePagination(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   err.Error(),
		})
		return
	}

	totalCount, courses, err := h.courseRepo.ListEnrolledCoursesWithProgress(ctx, int64(userID),
		models.CourseQuery{
			Page:     offset,
			PageSize: pageSize,
		})
	if err != nil {
		log.WithError(err).Error("error fetching courses progress")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while retrieving courses progress",
		})
		return
	}

	SetContentRangeHeader(c, "courses", len(courses), int(page), int(pageSize), int(totalCount))

	totalPages := (int(totalCount) + int(pageSize) - 1) / int(pageSize)

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

	course, err := h.courseRepo.GetCourseWithProgress(ctx, int64(userID), courseID)
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

func (h *courseHandler) GetCoursesCount(c *gin.Context) {
	ctx := c.Request.Context()
	count, err := h.courseRepo.GetCoursesCount(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "failed to get courses count"})
		return
	}
	c.JSON(http.StatusOK, models.Response{Success: true, Message: "courses count retrieved successfully", Payload: count})
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

func (h *courseHandler) SearchCourses(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "SearchCourses")
	ctx := c.Request.Context()

	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "search query is required",
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

	useFullText := c.Query("fulltext") == "true"

	totalCount, courses, err := h.courseRepo.SearchCourses(ctx, query, int(page), int(pageSize), useFullText)
	if err != nil {
		log.WithError(err).Error("error searching courses")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while searching courses",
		})
		return
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "courses found successfully",
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

func (h *courseHandler) ResetCourseProgress(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "ResetCourseProgress")
	ctx := c.Request.Context()

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil {
		log.Debug("invalid course ID")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course ID",
		})
		return
	}

	userID, err := GetUserID(c)
	if err != nil {
		log.Debug("unauthorized user tried to reset course progress")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "authentication required to reset course progress",
		})
		return
	}

	log.WithFields(logrus.Fields{
		"userID":   userID,
		"courseID": courseID,
	}).Debug("resetting course progress")

	if err := h.courseRepo.ResetCourseProgress(ctx, int64(userID), courseID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Debug("course not found")
			c.JSON(http.StatusNotFound, models.Response{
				Success:   false,
				ErrorCode: httperr.NoData,
				Message:   "course not found",
			})
			return
		}
		log.WithError(err).Error("error resetting course progress")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while resetting course progress",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course progress reset successfully",
	})
}

func (h *courseHandler) GetCourseTags(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "GetCourseTags")
	ctx := c.Request.Context()

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil {
		log.Debug("invalid course ID")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course ID",
		})
		return
	}

	tags, err := h.courseRepo.GetCourseTags(ctx, int32(courseID))
	if err != nil {
		log.WithError(err).Error("error fetching course tags")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while fetching course tags",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course tags retrieved successfully",
		Payload: tags,
	})
}

func (h *courseHandler) SearchCourseTags(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "SearchCourseTags")
	ctx := c.Request.Context()

	page, pageSize, offset, err := ParsePagination(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid pagination parameters",
		})
		return
	}

	query := c.Query("q")

	tags, totalCount, err := h.courseRepo.SearchCourseTags(ctx, query, int(offset), int(pageSize))
	if err != nil {
		log.WithError(err).Error("error searching course tags")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while searching course tags",
		})
		return
	}

	SetContentRangeHeader(c, "tags", len(tags), int(page), int(pageSize), int(totalCount))

	totalPages := (int(totalCount) + int(pageSize) - 1) / int(pageSize)

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course tags found successfully",
		Payload: models.PaginatedPayload{
			Items: tags,
			Pagination: models.Pagination{
				TotalItems:  totalCount,
				PageSize:    int(pageSize),
				CurrentPage: int(page),
				TotalPages:  int(totalPages),
			},
		},
	})
}

func (h *courseHandler) CreateCourseTag(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "CreateCourseTag")
	ctx := c.Request.Context()

	name := c.Query("name")

	if name == "" {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "tag name is required",
		})
		return
	}

	tagID, err := h.courseRepo.CreateCourseTag(ctx, name)
	if err != nil {
		log.WithError(err).Error("error creating course tag")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while creating course tag",
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "course tag created/queried successfully",
		Payload: models.Tag{
			ID:   tagID,
			Name: name,
		},
	})
}

func (h *courseHandler) InsertCourseTag(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "InsertCourseTag")
	ctx := c.Request.Context()

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil {
		log.Debug("invalid course ID")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidCourseID,
			Message:   "invalid course ID",
		})
		return
	}

	tagID, err := strconv.ParseInt(c.Param("tagId"), 10, 64)
	if err != nil {
		log.Debug("invalid tag ID")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid tag ID",
		})
		return
	}

	err = h.courseRepo.InsertCourseTag(ctx, int32(courseID), int32(tagID))
	if err != nil {
		log.WithError(err).Error("error inserting course tag")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while inserting course tag",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course tag inserted successfully",
	})
}

func (h *courseHandler) RemoveCourseTag(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "RemoveCourseTag")
	ctx := c.Request.Context()

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil {
		log.Debug("invalid course ID")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidCourseID,
			Message:   "invalid course ID",
		})
		return
	}

	tagID, err := strconv.ParseInt(c.Param("tagId"), 10, 64)
	if err != nil {
		log.Debug("invalid tag ID")
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid tag ID",
		})
		return
	}

	err = h.courseRepo.RemoveCourseTag(ctx, int32(courseID), int32(tagID))
	if err != nil {
		log.WithError(err).Error("error removing course tag")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while removing course tag",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "course tag removed successfully",
	})
}

func (h *courseHandler) RegisterRoutes(r *gin.RouterGroup) {
	courses := r.Group("/courses")
	courses.GET("/count", h.GetCoursesCount)

	authorized := courses.Group("", middleware.Auth())
	{
		authorized.GET("", h.ListAllCoursesWithOptionalProgress)
		authorized.POST("", h.CreateCourse)
		authorized.PUT("/:courseId", h.UpdateCourse)
		authorized.POST("/:courseId/publish", h.PublishCourse)
		authorized.GET("/:courseId", h.GetCourse)
		authorized.GET("/search", h.SearchCourses)
		authorized.GET("/progress", h.ListEnrolledCoursesWithProgress)
		authorized.GET("/:courseId/progress", h.GetCourseProgress)
		authorized.POST("/:courseId/start", h.StartCourse)
		authorized.POST("/:courseId/reset", h.ResetCourseProgress)
		authorized.DELETE("/:courseId", h.DeleteCourse)
		authorized.GET("/:courseId/tags", h.GetCourseTags)
		authorized.GET("/tags/search", h.SearchCourseTags)
		authorized.POST("/:courseId/tags/:tagId", h.InsertCourseTag)
		authorized.DELETE("/:courseId/tags/:tagId", h.RemoveCourseTag)
		authorized.POST("/tags", h.CreateCourseTag)
	}
}
