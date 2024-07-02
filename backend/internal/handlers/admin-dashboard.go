package handlers

import (
	"net/http"
)

func AdminDashboard(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Admin dashboard"))
}