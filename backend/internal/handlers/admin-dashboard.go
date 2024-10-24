package handlers

import (
	"net/http"

	"algolearn-backend/internal/router"
	"algolearn-backend/pkg/middleware"
)

type AdminDashboardHandler interface {
	AdminDashboard(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
}

type adminDashboardHandler struct{}

func NewAdminDashboardHandler() AdminDashboardHandler {
	return &adminDashboardHandler{}
}

func (h *adminDashboardHandler) AdminDashboard(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Admin dashboard"))
}

func (h *adminDashboardHandler) RegisterRoutes(r *router.Router) {
	admin := r.Group("/admin", middleware.Auth, middleware.IsAdmin)
	admin.Handle("", h.AdminDashboard, "GET")
}
