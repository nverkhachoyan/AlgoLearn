// internal/handlers/user.go
package handlers

import (
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/services"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"time"
)

// ValidateEmail validates the email format
func ValidateEmail(email string) bool {
	const emailRegex = `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`
	re := regexp.MustCompile(emailRegex)
	return re.MatchString(email)
}

// RespondWithJSON sends a JSON response with a given status
func RespondWithJSON(w http.ResponseWriter, status int, response models.Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}

// validateRegistrationInput performs input validation for registration
func validateRegistrationInput(req models.RegistrationRequest) (bool, string) {
	if len(req.Username) < 5 || len(req.Username) > 20 {
		return false, "Username must be between 5 and 20 characters long"
	}
	if len(req.Password) < 8 {
		return false, "Password must be at least 8 characters long"
	}
	if !ValidateEmail(req.Email) {
		return false, "Invalid email format"
	}
	return true, ""
}

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var req models.RegistrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	if isValid, message := validateRegistrationInput(req); !isValid {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: message})
		return
	}

	hashedPassword, err := services.HashPassword(req.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	user := models.User{
		Username:       req.Username,
		Email:          req.Email,
		PasswordHash:   hashedPassword,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		Role:           "user", // default role
		IsActive:       true,
		IsEmailVerified: false,
		CPUs:           0,  // default CPUs
		Preferences:    `{}`, // Default to an empty JSON object as a string
	}

	if err := repository.CreateUser(&user); err != nil {
		log.Printf("Error creating user: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create user"})
		return
	}

	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User created successfully",
		Data:    map[string]interface{}{"token": token},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func LoginUser(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request"})
		return
	}

	user, err := repository.GetUserByEmail(req.Email)
	if err != nil {
		log.Printf("Login failed for user %s: %v", req.Email, err)
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Invalid email or password"})
		return
	}

	if !services.CheckPasswordHash(req.Password, user.PasswordHash) {
		log.Printf("Login failed for user %s: invalid password", req.Email)
		log.Printf("Provided password: %s", req.Password)
		log.Printf("Stored hash: %s", user.PasswordHash)
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Invalid email or password"})
		return
	}

	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("Error generating token for user %s: %v", req.Email, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Logged in successfully",
		Data:    map[string]interface{}{"token": token},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	// Ensure the user being updated is the one authenticated
	if user.ID != userID {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Cannot update another user"})
		return
	}

	user.UpdatedAt = time.Now()

	if err := repository.UpdateUser(&user); err != nil {
		log.Printf("Error updating user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not update user"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User updated successfully"})
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	user, err := repository.GetUserByID(userID)
	if err != nil {
		log.Printf("Error retrieving user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve user"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User retrieved successfully", Data: user})
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	if err := repository.DeleteUser(userID); err != nil {
		log.Printf("Error deleting user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not delete user"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User deleted successfully"})
}
