package handlers

import (
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

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

func SetContentRangeHeader(c *gin.Context, resource string, resourceLen int, page, pageSize, totalCount int64) {
	start := (page - 1) * pageSize
	end := start + int64(resourceLen)
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

func parseSort(c *gin.Context) (string, string) {
	var sortColumn, sortDirection string
	if sortParam := c.Query("sort"); sortParam != "" {
		// Expecting format: sort=["column","direction"]
		var sortArray []string
		if err := json.Unmarshal([]byte(sortParam), &sortArray); err == nil && len(sortArray) == 2 {
			sortColumn = sortArray[0]
			sortDirection = sortArray[1]
		}
	}
	return sortColumn, sortDirection
}
