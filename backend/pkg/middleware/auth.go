package middleware

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
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
			log.Debug("no authorization header")
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "missing authorization header",
			})
			return
		}

		if !strings.HasPrefix(authHeader, BearerSchema) {
			log.Debug("invalid authorization header format")
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "invalid authorization header format",
			})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, BearerSchema)
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			// Return the secret key used to sign the token
			return []byte("your-secret-key"), nil // TODO: Move to config
		})

		if err != nil {
			log.WithError(err).Debug("failed to parse token")
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "invalid token",
			})
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Get user ID from claims
			userID, ok := claims["user_id"].(float64)
			if !ok {
				log.Debug("user_id claim not found or invalid")
				c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
					Success:   false,
					ErrorCode: codes.Unauthorized,
					Message:   "invalid token claims",
				})
				return
			}

			// Set user ID in context
			c.Set(UserIDKey, int64(userID))
			c.Next()
		} else {
			log.Debug("invalid token claims")
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.Response{
				Success:   false,
				ErrorCode: codes.Unauthorized,
				Message:   "invalid token claims",
			})
			return
		}
	}
}
