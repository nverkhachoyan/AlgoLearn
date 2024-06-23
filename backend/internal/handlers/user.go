package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/services"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"time"
)

func ValidateEmail(email string) bool {
	const emailRegex = `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`
	re := regexp.MustCompile(emailRegex)
	return re.MatchString(email)
}

func respondWithJSON(w http.ResponseWriter, status int, response models.Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var req models.RegistrationRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		respondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	// Validate username length
	if len(req.Username) < 5 || len(req.Username) > 20 {
		respondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Username must be between 5 and 20 characters long"})
		return
	}

	// Validate password length
	if len(req.Password) < 8 {
		respondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Password must be at least 8 characters long"})
		return
	}

	// Validate email format
	if !ValidateEmail(req.Email) {
		respondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid email format"})
		return
	}

	hashedPassword, err := services.HashPassword(req.Password)
	if err != nil {
		respondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not hash password"})
		return
	}

	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	err = repository.CreateUser(user)
	if err != nil {
		respondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create user. Is there another account with this email address?"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User created successfully",
		Data:    map[string]interface{}{"id": user.ID},
	}

	respondWithJSON(w, http.StatusCreated, response)
}

func LoginUser(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		respondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	user, err := repository.GetUserByEmail(req.Email)
	if err != nil {
		respondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Invalid email or password"})
		return
	}

	if !services.CheckPasswordHash(req.Password, user.PasswordHash) {
		respondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Invalid email or password"})
		return
	}

	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		respondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not generate token"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Logged in successfully",
		Data:    map[string]interface{}{"token": token},
	}

	respondWithJSON(w, http.StatusOK, response)
}

func SomeProtectedHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		respondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: fmt.Sprintf("Hello, user %d", userID),
	}

	respondWithJSON(w, http.StatusOK, response)
}
