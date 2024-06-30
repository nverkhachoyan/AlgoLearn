package router

import (
	"algolearn-backend/internal/handlers"
	"algolearn-backend/internal/models"
	"algolearn-backend/pkg/middleware"
	"net/http"
)

func methodNotAllowed(w http.ResponseWriter, r *http.Request) {
	handlers.RespondWithJSON(w, http.StatusMethodNotAllowed, models.Response{Status: "error", Error: "Method not allowed"})
}

func SetupRouter() *http.ServeMux {
	mux := http.NewServeMux()

	// User endpoint
	mux.HandleFunc("POST /user/login", handlers.LoginUser)
	mux.HandleFunc("POST /user/register", handlers.RegisterUser)
	mux.HandleFunc("/user", methodNotAllowed)

	// Topics endpoint
	mux.HandleFunc("GET /topics", handlers.GetAllTopics)
	mux.HandleFunc("/topics", methodNotAllowed)

	// Protected routes require the setup below
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("GET /protected", handlers.SomeProtectedHandler)
	// Wrap the protected routes with Auth middleware
	mux.Handle("/protected", middleware.Auth(protectedMux))

	return mux
}
