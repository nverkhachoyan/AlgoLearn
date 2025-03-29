package models

import (
	"encoding/json"
	"time"

	"github.com/gin-gonic/gin"
)

func SafeInt32(ptr *int) int32 {
	if ptr == nil {
		return 0 // or whatever default value makes sense
	}
	return int32(*ptr)
}

func SafeTime(ptr *time.Time) time.Time {
	if ptr == nil {
		return time.Time{} // zero time
	}
	return *ptr
}

func ParseUserFilters(c *gin.Context) (UserFilters, error) {
	var filters UserFilters
	if filterParam := c.Query("filter"); filterParam != "" {
		if err := json.Unmarshal([]byte(filterParam), &filters); err != nil {
			return UserFilters{}, err
		}
	}
	return filters, nil
}
