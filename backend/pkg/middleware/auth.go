// pkg/middleware/auth.go
package middleware

import (
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/services"
	"context"
	"net/http"
	"strings"
)

type contextKey string

const userContextKey contextKey = "userID"

func IsAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := GetUserID(r.Context())
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		user, err := repository.GetUserByID(userID)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if user.Role == "admin" {
			next.ServeHTTP(w, r)
			return
		}

		http.Error(w, "You are not authorized to access this resource", http.StatusUnauthorized)
	})
}

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := services.ValidateJWT(tokenString)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
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
