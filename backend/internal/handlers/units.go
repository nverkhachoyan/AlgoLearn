// internal/handlers/units.go
package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func GetAllUnits(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	courseID, err := strconv.Atoi(params["course_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid course ID"})
		return
	}

	units, err := repository.GetUnitsByCourseID(courseID)
	if err != nil {
		log.Printf("Error fetching units for course %d: %v", courseID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve units"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Units retrieved successfully", Data: units})
}

func GetUnitByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid unit ID"})
		return
	}

	unit, err := repository.GetUnitByID(id)
	if err != nil {
		log.Printf("Error fetching unit %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve unit"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Unit retrieved successfully", Data: unit})
}

func CreateUnit(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can create units
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	if err := repository.CreateUnit(&unit); err != nil {
		log.Printf("Error creating unit: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create unit"})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{Status: "success", Message: "Unit created successfully", Data: unit})
}

func UpdateUnit(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can update units
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid unit ID"})
		return
	}

	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}
	unit.ID = id

	if err := repository.UpdateUnit(&unit); err != nil {
		log.Printf("Error updating unit %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not update unit"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Unit updated successfully"})
}

func DeleteUnit(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	// Only admin users can delete units
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Access denied"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid unit ID"})
		return
	}

	if err := repository.DeleteUnit(id); err != nil {
		log.Printf("Error deleting unit %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not delete unit"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Unit deleted successfully"})
}
