package middleware

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"algolearn/pkg/security"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
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
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "missing authorization header",
			})
			return
		}

		if !strings.HasPrefix(authHeader, BearerSchema) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "invalid authorization header format",
			})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, BearerSchema)

		secretKey := security.GetJWTKey()
		if len(secretKey) == 0 {
			log.Error("JWT configuration error")
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "server configuration error",
			})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return secretKey, nil
		})

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "invalid token",
			})
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			userID, ok := claims["user_id"].(float64)
			if !ok {
				c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
					Success:   false,
					ErrorCode: codes.Unauthorized,
					Message:   "invalid token claims",
				})
				return
			}

			c.Set(UserIDKey, int64(userID))
			c.Next()
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "invalid token claims",
			})
			return
		}
	}
}
