package middleware

import (
	"context"
	"net/http"
	"strings"
)

// Define a custom type for context keys to avoid collisions
type paramContextKey string

// PathParamMiddleware extracts path parameters and adds them to the request context
func PathParamMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.Trim(r.URL.Path, "/")
		parts := strings.Split(path, "/")

		for i := 0; i < len(parts)-1; i++ {
			if strings.HasPrefix(parts[i], ":") {
				key := paramContextKey(parts[i][1:])
				value := parts[i+1]
				r = r.WithContext(context.WithValue(r.Context(), key, value))
			}
		}

		next.ServeHTTP(w, r)
	})
}

// GetPathParam retrieves a path parameter from the request context
func GetPathParam(r *http.Request, name string) string {
	if value := r.Context().Value(paramContextKey(name)); value != nil {
		return value.(string)
	}
	return ""
}
