package router

import (
	"algolearn-backend/internal/handlers"
	"algolearn-backend/pkg/middleware"
	"net/http"
)

func methodNotAllowed(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func SetupRouter() *http.ServeMux {
	mux := http.NewServeMux()

	// User endpoint
	mux.HandleFunc("GET /user", handlers.LoginUser)
	mux.HandleFunc("POST /user", handlers.RegisterUser)
	mux.HandleFunc("/user", methodNotAllowed)

	// Protected routes require the setup below
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("GET /protected", handlers.SomeProtectedHandler)
	// Wrap the protected routes with Auth middleware
	mux.Handle("/protected", middleware.Auth(protectedMux))

	return mux
}
