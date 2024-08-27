// pkg/middleware/auth.go
package middleware

import (
	"algolearn-backend/internal/errors"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/services"
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

type contextKey string

const userContextKey contextKey = "userID"

func RespondWithJSON(w http.ResponseWriter, status int, response models.Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}

func IsAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := GetUserID(r.Context())
		if !ok {
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
		user, err := repository.GetUserByID(userID)
		if err != nil {
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

		ctx := context.WithValue(r.Context(), userContextKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Function to retrieve userID from context
func GetUserID(ctx context.Context) (int, bool) {
	userID, ok := ctx.Value(userContextKey).(int)
	return userID, ok
}
