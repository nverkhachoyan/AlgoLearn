package handlers

import (
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

func IsUniqueConstraintViolation(err error, constraints []string) bool {
	var pqErr *pq.Error
	if errors.As(err, &pqErr) {
		if pqErr.Code == "23505" {
			if itDoContain := slices.Contains(constraints, pqErr.Constraint); itDoContain {
				return true
			}
		}
	}

	return false
}

func GetUserID(c *gin.Context) (int32, error) {
	log := logger.Get().WithBaseFields(logger.Handler, "GetUserID")

	userIDInterface, exists := c.Get(middleware.UserIDKey)
	if !exists {
		log.Warn("UserID not found in context")
		return 0, errors.New("unauthorized: user ID not found in context")
	}

	userID, ok := userIDInterface.(int32)
	if !ok {
		log.Errorf("invalid userID type: %T", userIDInterface)
		return 0, fmt.Errorf("internal error: invalid user ID type: %T", userIDInterface)
	}

	if userID <= 0 {
		log.Warn("Invalid user ID value: <= 0")
		return 0, errors.New("invalid user ID value")
	}

	return userID, nil
}

func SetContentRangeHeader(c *gin.Context, resource string, resourceLen, page, pageSize, totalCount int) {
	start := (page - 1) * pageSize
	end := start + resourceLen
	if end > 0 {
		end = end - 1
	}

	if resourceLen == 0 {
		start = 0
		end = 0
		if start >= totalCount && totalCount > 0 {
			c.Status(http.StatusNoContent)
			return
		}
	}
	c.Header("X-Total-Count", fmt.Sprintf("%d", totalCount))
	c.Header("Content-Range", fmt.Sprintf("%s %d-%d/%d", resource, start, end, totalCount))
}

func ParseSort(c *gin.Context) (string, string) {
	sortColumn := c.Query("sort")
	sortDirection := c.Query("order")
	return sortColumn, sortDirection
}

func ParsePagination(c *gin.Context) (int, int, int, error) {
	page, err := strconv.ParseInt(c.Query("page"), 10, 64)
	if err != nil || page < 1 {
		return 0, 0, 0, errors.New("invalid page number: must be a positive integer")
	}

	pageSize, err := strconv.ParseInt(c.Query("pageSize"), 10, 64)
	if err != nil || pageSize < 1 {
		return 0, 0, 0, errors.New("invalid page size: must be a positive integer")
	}

	offset := (page - 1) * pageSize

	return int(page), int(pageSize), int(offset), nil
}
