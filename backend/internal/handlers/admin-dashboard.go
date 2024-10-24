package handlers

import (
	"net/http"

	"algolearn/internal/router"
	"algolearn/pkg/middleware"
)

type AdminDashboardHandler interface {
	AdminDashboard(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
}

type adminDashboardHandler struct{}

func NewAdminDashboardHandler() AdminDashboardHandler {
	return &adminDashboardHandler{}
}

func (h *adminDashboardHandler) AdminDashboard(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Admin dashboard"))
}

func (h *adminDashboardHandler) RegisterRoutes(r *router.Router) {
	admin := r.Group("/admin", middleware.Auth, middleware.IsAdmin)
	admin.Handle("", h.AdminDashboard, "GET")
}
