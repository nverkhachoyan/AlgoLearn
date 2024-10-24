package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/router"

	"net/http"
)

type HealthHandler interface {
	Welcome(w http.ResponseWriter, _ *http.Request)
	Health(w http.ResponseWriter, _ *http.Request)
	RegisterRoutes(r *router.Router)
}

type healthHandler struct{}

func NewHealthHandler() HealthHandler {
	return &healthHandler{}
}

func (h *healthHandler) Welcome(w http.ResponseWriter, _ *http.Request) {
	response := models.Response{Status: "success", Message: "Welcome to AlgoLearn API"}
	RespondWithJSON(w, http.StatusOK, response)
}

// Health check endpoint
func (h *healthHandler) Health(w http.ResponseWriter, _ *http.Request) {
	response := models.Response{Status: "success", Message: "Healthy"}
	RespondWithJSON(w, http.StatusOK, response)
}

func (h *healthHandler) RegisterRoutes(r *router.Router) {
	public := r.Group("")
	public.Handle("/", h.Welcome, "GET")
	public.Handle("/health", h.Health, "GET")
}
