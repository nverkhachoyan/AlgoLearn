// internal/handlers/user.go
package handlers

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/errors"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/services"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"fmt"
	"log"
	"mime/multipart"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
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

func CheckEmailExists(w http.ResponseWriter, r *http.Request) {
	var email string = r.URL.Query().Get("email")

	user, _ := repository.GetUserByEmail(email)
	if user != nil {
		RespondWithJSON(w, http.StatusAccepted, models.Response{Status: "success", ErrorCode: errors.ACCOUNT_EXISTS, Message: "An account with this email already exists"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "error", Message: "An account with this email does not exist"})
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

	// Check if user with email already exists
	userByEmail, _ := repository.GetUserByEmail(req.Email)
	// if err != nil {
	// 	log.Printf("Error fetching user by email: %v", err)
	// 	RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", ErrorCode: "INTERNAL_ERROR", Message: "Internal server error"})
	// 	return
	// }
	if userByEmail != nil {
		RespondWithJSON(w, http.StatusAccepted, models.Response{Status: "error", ErrorCode: errors.ACCOUNT_EXISTS, Message: "An account with this email already exists"})
		return
	}

	hashedPassword, err := services.HashPassword(req.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	user := &models.User{
		Username:        req.Username,
		Email:           req.Email,
		PasswordHash:    hashedPassword,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
		Role:            "user", // default role
		IsActive:        true,
		IsEmailVerified: false,
		CPUs:            0,    // default CPUs
		Preferences:     `{}`, // Default to an empty JSON object as a string
	}

	if err := repository.CreateUser(user); err != nil {
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

// Uploads avatar to S3 and returns URL
func uploadUserAvatarToS3(s3Session *s3.S3, file multipart.File, userID int) (string, error) {
	objectKey := "users/" + strconv.Itoa(userID) + "/public/avatars/" + uuid.New().String()

	putObjectInput := &s3.PutObjectInput{
		Bucket: aws.String("algolearn"),
		Key:    aws.String(objectKey),
		Body:   file,
		ACL:    aws.String("public-read"),
	}

	// Upload file to S3
	_, err := s3Session.PutObject(putObjectInput)
	if err != nil {
		fmt.Printf("Error uploading user avatar to S3 object storage")
		return "", fmt.Errorf("error uploading to S3: %v", err)
	}

	avatarURL := fmt.Sprintf("https://%s/%s", "algolearn.sfo3.cdn.digitaloceanspaces.com", objectKey)
	return avatarURL, nil
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	tokenStr := strings.Split(r.Header.Get("Authorization"), " ")[1]
	if tokenStr == "" {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	claims, err := services.ValidateJWT(tokenStr)
	if err != nil {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	userID := int(claims.UserID)

	// Parsing multipart form data
	err = r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", ErrorCode: errors.INVALID_FORM_DATA, Message: "Invalid Form Data was sent in the request"})
		return
	}

	var user models.User
	jsonData := r.FormValue("data")
	if err := json.Unmarshal([]byte(jsonData), &user); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", ErrorCode: errors.INVALID_JSON, Message: "Invalid JSON was sent in the request"})
		return
	}

	// Set userID from token
	user.ID = userID
	user.UpdatedAt = time.Now()

	// Handling avatar upload if present
	file, _, err := r.FormFile("avatar")
	if err == nil {
		defer file.Close()
		s3Session := config.GetS3Sesssion()
		avatarURL, err := uploadUserAvatarToS3(s3Session, file, userID)
		if err != nil {
			RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", ErrorCode: errors.FILE_UPLOAD_FAILED, Message: "File upload to S3 object storage has failed"})
			return
		}
		user.ProfilePictureURL = avatarURL
	} else if err != http.ErrMissingFile {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.FILE_UPLOAD_FAILED,
				Message:   "Error while processing avatar upload, but file is not missing, it's likely something else"})
		return
	}

	log.Printf("Updating user data: %+v\n", user)

	if err := repository.UpdateUser(&user); err != nil {
		log.Printf("Error updating user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
				Message:   "Failed to update the user table in the database, likely issue with repository function, or database is down"})
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
