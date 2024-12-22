package handlers

import (
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"errors"
	"fmt"

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
