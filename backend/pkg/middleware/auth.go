package middleware

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"algolearn/pkg/security"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	// UserIDKey is used to store the user ID in the context
	UserIDKey = "userID"
	// BearerSchema is the prefix for the Authorization header
	BearerSchema = "Bearer "
)

// Auth middleware verifies the JWT token and sets the user ID in the context
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		log := logger.Get().WithBaseFields(logger.Middleware, "Auth")

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Warn("Missing authorization header")
			c.Abort()
			c.JSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "missing authorization header",
			})
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			log.Warnf("Invalid auth header format. Expected 'Bearer <token>', got: '%s'", authHeader)
			c.Abort()
			c.JSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "invalid authorization header format",
			})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if len(tokenString) == 0 {
			log.Warn("Empty token after Bearer prefix")
			c.Abort()
			c.JSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "empty token",
			})
			return
		}

		claims, err := security.ValidateJWT(tokenString)
		if errors.Is(err, security.ErrTokenExpired) {
			log.Warnf("Token validation failed: %v", err)
			c.Abort()
			c.JSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.TokenExpired,
				Message:   "token expired",
			})
			return
		} else if err != nil {
			log.Warnf("Token validation failed: %v", err)
			c.Abort()
			c.JSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "invalid token",
			})
			return
		}

		c.Set(UserIDKey, claims.UserID)
		c.Next()
	}
}
