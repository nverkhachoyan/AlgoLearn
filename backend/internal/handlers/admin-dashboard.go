package handlers

import (
	"net/http"
)

type AdminDashboardHandler interface {
	AdminDashboard(w http.ResponseWriter, r *http.Request)
}

type adminDashboardHandler struct{}

func NewAdminDashboardHandler() AdminDashboardHandler {
	return &adminDashboardHandler{}
}

func (h *adminDashboardHandler) AdminDashboard(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Admin dashboard"))
}
