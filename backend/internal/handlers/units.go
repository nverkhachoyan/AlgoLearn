package handlers

import (
	httperr "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"database/sql"
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type UnitHandler interface {
	CreateUnit(c *gin.Context)
	GetUnitByID(c *gin.Context)
	GetUnitsByCourseID(c *gin.Context)
	UpdateUnit(c *gin.Context)
	UpdateUnitNumber(c *gin.Context)
	DeleteUnit(c *gin.Context)
	GetUnitsCount(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
}

type unitHandler struct {
	unitRepo service.UnitService
	log      *logger.Logger
}

func NewUnitHandler(unitRepo service.UnitService) UnitHandler {
	return &unitHandler{
		unitRepo: unitRepo,
		log:      logger.Get(),
	}
}

func (h *unitHandler) CreateUnit(c *gin.Context) {
	ctx := c.Request.Context()

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course ID: must be a positive integer",
		})
		return
	}

	var unit models.Unit
	if err := c.ShouldBindJSON(&unit); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit data",
		})
		return
	}

	createdUnit, err := h.unitRepo.CreateUnit(ctx, courseID, unit.UnitNumber, unit.Name, unit.Description)
	if err != nil && IsDuplicateError(err, []string{"unique_unit_number_per_course"}) {
		h.log.WithError(err).Error("unit number already exists")
		c.JSON(http.StatusConflict, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidRequest,
			Message:   "unit number already exists",
		})
		return
	} else if err != nil {
		h.log.WithError(err).Error("failed to create unit")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while creating unit",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "unit created successfully",
		Payload: createdUnit,
	})
}

func (h *unitHandler) GetUnitByID(c *gin.Context) {
	ctx := c.Request.Context()

	unitID, err := strconv.ParseInt(c.Param("unitId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit ID: must be a positive integer",
		})
		return
	}

	unit, err := h.unitRepo.GetUnitByID(ctx, unitID)
	if errors.Is(err, sql.ErrNoRows) {
		h.log.WithError(err).Warn("unit not found")
		c.JSON(http.StatusOK, models.Response{
			Success: true,
			Message: "unit not found",
			Payload: unit,
		})
		return
	} else if err != nil {
		h.log.WithError(err).Error("failed to get unit by ID")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while getting unit by ID",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "unit retrieved successfully",
		Payload: unit,
	})
}

func (h *unitHandler) GetUnitsByCourseID(c *gin.Context) {
	ctx := c.Request.Context()

	courseID, err := strconv.ParseInt(c.Param("courseId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid course ID: must be a positive integer",
		})
		return
	}

	units, err := h.unitRepo.GetUnitsByCourseID(ctx, courseID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		h.log.WithError(err).Error("failed to get units by course ID")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while getting units by course ID",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "units retrieved successfully",
		Payload: units,
	})
}

func (h *unitHandler) UpdateUnit(c *gin.Context) {
	ctx := c.Request.Context()

	unitID, err := strconv.ParseInt(c.Param("unitId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit ID: must be a positive integer",
		})
		return
	}

	var unit models.Unit
	if err := c.ShouldBindJSON(&unit); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit data",
		})
		return
	}

	updatedUnit, err := h.unitRepo.UpdateUnit(ctx, unitID, unit.Name, unit.Description)
	if err != nil {
		h.log.WithError(err).Error("failed to update unit")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while updating unit",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "unit updated successfully",
		Payload: updatedUnit,
	})
}

func (h *unitHandler) UpdateUnitNumber(c *gin.Context) {
	ctx := c.Request.Context()

	unitID, err := strconv.ParseInt(c.Param("unitId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit ID: must be a positive integer",
		})
		return
	}

	var unit models.Unit
	if err := c.ShouldBindJSON(&unit); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit data",
		})
		return
	}

	updatedUnit, err := h.unitRepo.UpdateUnitNumber(ctx, unitID, unit.UnitNumber)
	if err != nil {
		h.log.WithError(err).Error("failed to update unit number")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while updating unit number",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "unit number updated successfully",
		Payload: updatedUnit,
	})
}

func (h *unitHandler) DeleteUnit(c *gin.Context) {
	ctx := c.Request.Context()

	unitID, err := strconv.ParseInt(c.Param("unitId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidInput,
			Message:   "invalid unit ID: must be a positive integer",
		})
		return
	}

	err = h.unitRepo.DeleteUnit(ctx, unitID)
	if err != nil {
		h.log.WithError(err).Error("failed to delete unit")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "internal server error while deleting unit",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "unit deleted successfully",
	})
}

func (h *unitHandler) GetUnitsCount(c *gin.Context) {
	ctx := c.Request.Context()
	count, err := h.unitRepo.GetUnitsCount(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "failed to get units count"})
		return
	}
	c.JSON(http.StatusOK, models.Response{Success: true, Message: "units count retrieved successfully", Payload: count})
}

func (h *unitHandler) RegisterRoutes(r *gin.RouterGroup) {

	units := r.Group("/courses/:courseId/units")

	units.GET("/count", h.GetUnitsCount)
	{
		units.POST("", h.CreateUnit)
		units.GET("/:unitId", h.GetUnitByID)
		units.GET("", h.GetUnitsByCourseID)
		units.PUT("/:unitId", h.UpdateUnit)
		units.PUT("/:unitId/number", h.UpdateUnitNumber)
		units.DELETE("/:unitId", h.DeleteUnit)

	}
}
