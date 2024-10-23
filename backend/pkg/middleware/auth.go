package middleware

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/errors"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/services"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

type contextKey string

const userContextKey contextKey = "userID"

func RespondWithJSON(w http.ResponseWriter, status int, response models.Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		config.Log.Errorf("failed to respond with JSON: %v", err.Error())
		return
	}
}

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			RespondWithJSON(
				w,
				http.StatusUnauthorized,
				models.Response{Status: "error", ErrorCode: errors.UNAUTHORIZED,
					Message: "Authorization header required",
				})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := services.ValidateJWT(tokenString)
		if err != nil {
			RespondWithJSON(
				w,
				http.StatusUnauthorized,
				models.Response{Status: "error", ErrorCode: errors.UNAUTHORIZED,
					Message: "Invalid token",
				})
			return
		}

		log.Printf("Authenticated user with ID: %d", claims.UserID)
		ctx := context.WithValue(r.Context(), userContextKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func IsAdmin(next http.Handler) http.Handler {
	db := config.GetDB()
	userRepo := repository.NewUserRepository(db)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := GetUserID(r.Context())
		if !ok {
			log.Printf("Failed to retrieve userID from context")
			RespondWithJSON(
				w,
				http.StatusUnauthorized,
				models.Response{
					Status:    "error",
					ErrorCode: errors.UNAUTHORIZED,
					Message:   "You are not authorized to access this endpoint",
				})
			return
		}
		log.Printf("Retrieved userID: %d", userID)
		user, err := userRepo.GetUserByID(userID)
		if err != nil {
			log.Printf("Failed to retrieve user from DB for ID: %d", userID)
			RespondWithJSON(
				w,
				http.StatusUnauthorized,
				models.Response{
					Status:    "error",
					ErrorCode: errors.UNAUTHORIZED,
					Message:   "Failed to identify the user in the system",
				})
			return
		}

		if user.Role == "admin" {
			next.ServeHTTP(w, r)
			return
		}

		RespondWithJSON(
			w,
			http.StatusUnauthorized,
			models.Response{Status: "error", ErrorCode: errors.UNAUTHORIZED,
				Message: "You are not authorized to access this endpoint",
			})
	})
}

// GetUserID Function to retrieve userID from context
func GetUserID(ctx context.Context) (int64, bool) {
	userID, ok := ctx.Value(userContextKey).(int64)
	return userID, ok
}
