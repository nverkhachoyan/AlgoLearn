package handlers

import (
	"algolearn/internal/config"
	"algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/repository"
	"algolearn/internal/router"
	"algolearn/internal/services"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"context"

	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
)

type UserHandler interface {
	CheckEmailExists(w http.ResponseWriter, r *http.Request)
	RegisterUser(w http.ResponseWriter, r *http.Request)
	LoginUser(w http.ResponseWriter, r *http.Request)
	// UpdateUser(w http.ResponseWriter, r *http.Request)
	GetUser(w http.ResponseWriter, r *http.Request)
	DeleteUser(w http.ResponseWriter, r *http.Request)
	RegisterRoutes(r *router.Router)
}

type userHandler struct {
	repo repository.UserRepository
}

func NewUserHandler(repo repository.UserRepository) UserHandler {
	return &userHandler{repo: repo}
}

// ValidateEmail validates the email format
func (h *userHandler) ValidateEmail(email string) bool {
	const emailRegex = `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`
	re := regexp.MustCompile(emailRegex)
	return re.MatchString(email)
}

// validateRegistrationInput performs input validation for registration
func (h *userHandler) validateRegistrationInput(req models.RegistrationRequest) (bool, string) {
	if len(req.Username) < 5 || len(req.Username) > 20 {
		return false, "Username must be between 5 and 20 characters long"
	}
	if len(req.Password) < 8 {
		return false, "Password must be at least 8 characters long"
	}
	if !h.ValidateEmail(req.Email) {
		return false, "Invalid email format"
	}
	return true, ""
}

func (h *userHandler) CheckEmailExists(w http.ResponseWriter, r *http.Request) {
	log := logger.Get().WithBaseFields(logger.Handler, "CheckEmailExists")
	ctx := r.Context()
	email := r.URL.Query().Get("email")

	exists, err := h.repo.CheckEmailExists(ctx, email)
	if err != nil {
		log.WithError(err).Error("failed to check if email exists")
		RespondWithJSON(w, http.StatusAccepted,
			models.Response{
				Success:   true,
				ErrorCode: errors.DatabaseFail,
				Message:   "failed to check if email exists",
			})
		return
	}

	if exists {
		RespondWithJSON(w, http.StatusAccepted,
			models.Response{
				Success:   true,
				ErrorCode: errors.AccountExists,
				Message:   "an account with this email already exists",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Success:   false,
			ErrorCode: errors.NoData,
			Message:   "an account with this email does not exist",
		})
}

func (h *userHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	log := logger.Get()
	var req models.RegistrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{Success: false,
				ErrorCode: errors.InvalidJson,
				Message:   "invalid JSON"})
		return
	}

	if isValid, message := h.validateRegistrationInput(req); !isValid {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{Success: false,
				ErrorCode: errors.InvalidFormData,
				Message:   message,
			})
		return
	}

	// Check if user with email already exists
	emailExists, _ := h.repo.CheckEmailExists(ctx, req.Email)

	if emailExists {
		RespondWithJSON(w, http.StatusAccepted, models.Response{
			Success:   false,
			ErrorCode: errors.AccountExists,
			Message:   "an account with this email already exists"})
		return
	}

	hashedPassword, err := services.HashPassword(req.Password)
	if err != nil {
		log.Errorf("error hashing password: %v\n", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.InternalError,
				Message:   "internal server error",
			})
		return
	}

	user := &models.User{
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
		Username:        req.Username,
		Email:           req.Email,
		PasswordHash:    hashedPassword,
		Role:            "admin",
		IsActive:        true,
		IsEmailVerified: false,
		CPUs:            0,
	}

	newUser, err := h.repo.CreateUser(user)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: errors.InternalError,
			Message:   "Failed to create user",
		})
		return
	}

	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.InternalError,
				Message:   "Internal server error",
			})
		return
	}

	response := models.Response{
		Success: true,
		Message: "User created successfully",
		Data:    map[string]interface{}{"token": token, "user": newUser},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func (h *userHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Success: false, ErrorCode: errors.InvalidJson, Message: "Invalid JSON"})
		return
	}

	user, err := h.repo.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		log.Printf("Login failed for user %s: %v", req.Email, err)
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.InvalidCredentials,
				Message:   "Invalid email or password",
			})
		return
	}

	if !services.CheckPasswordHash(req.Password, user.PasswordHash) {
		log.Printf("Login failed for user %s: invalid password", req.Email)
		log.Printf("Provided password: %s", req.Password)
		log.Printf("Stored hash: %s", user.PasswordHash)
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Success: false, ErrorCode: errors.InvalidCredentials, Message: "Invalid email or password"})
		return
	}

	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("Error generating token for user %s: %v", req.Email, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.InternalError,
				Message:   "Internal server error",
			})
		return
	}

	response := models.Response{
		Success: true,
		Message: "Logged in successfully",
		Data:    map[string]interface{}{"token": token, "user": user},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func uploadUserAvatarToS3(s3Session *s3.S3, file multipart.File, userID int32) (string, error) {
	objectKey := "users/" + string(userID) + "/public/avatars/" + uuid.New().String()

	putObjectInput := &s3.PutObjectInput{
		Bucket: aws.String("algolearn"),
		Key:    aws.String(objectKey),
		Body:   file,
		ACL:    aws.String("public-read"),
	}

	_, err := s3Session.PutObject(putObjectInput)
	if err != nil {
		fmt.Printf("Error uploading user avatar to S3 object storage")
		return "", fmt.Errorf("error uploading to S3: %v", err)
	}

	avatarURL := fmt.Sprintf("https://%s/%s", "algolearn.sfo3.cdn.digitaloceanspaces.com", objectKey)
	return avatarURL, nil
}

func (h *userHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	tokenStr := strings.Split(r.Header.Get("Authorization"), " ")[1]
	if tokenStr == "" {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.Unauthorized,
				Message:   "You are not authorized to update the user's account",
			})
		return
	}

	claims, err := services.ValidateJWT(tokenStr)
	if err != nil {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.Unauthorized,
				Message:   "You are not authorized to make that request",
			})
		return
	}

	userID := claims.UserID

	fmt.Printf("User ID: %d\n", userID)

	// Parsing multipart form data
	err = r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: errors.InvalidFormData,
				Message:   "Invalid Form Data was sent in the request",
			})
		return
	}

	var user models.User
	jsonData := r.FormValue("data")
	if err := json.Unmarshal([]byte(jsonData), &user); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: errors.InvalidJson,
				Message:   "Invalid JSON was sent in the request",
			})
		return
	}

	user.ID = userID
	user.UpdatedAt = time.Now()

	file, _, err := r.FormFile("avatar")
	if err == nil {
		defer file.Close()
		s3Session := config.GetS3Sesssion()
		avatarURL, err := uploadUserAvatarToS3(s3Session, file, userID)
		if err != nil {
			RespondWithJSON(w, http.StatusInternalServerError,
				models.Response{
					Success:   false,
					ErrorCode: errors.FileUploadFailed,
					Message:   "File upload to S3 object storage has failed",
				})
			return
		}
		user.ProfilePictureURL = avatarURL
	} else if err != http.ErrMissingFile {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.FileUploadFailed,
				Message:   "Error while processing avatar upload, but file is not missing, it's likely something else",
			})
		return
	}

	log.Printf("Updating user data: %+v\n", user)

	if err := h.repo.UpdateUser(&user); err != nil {
		log.Printf("Error updating user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.DatabaseFail,
				Message:   fmt.Sprintf("failed to update user: %s", err.Error()),
			})
		return
	}
	newUserData, err := h.repo.GetUserByID(userID)

	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.InternalError,
				Message:   "Failed to fetch the user that was updated",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Success: true, Message: "User updated successfully", Data: newUserData})
}

func (h *userHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{Success: false,
				ErrorCode: errors.Unauthorized,
				Message:   "Unauthorized to retrieve user account",
			})
		return
	}

	user, err := h.repo.GetUserByID(userID)
	if err != nil {
		log.Printf("Error retrieving user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.DatabaseFail,
				Message:   "Failed to retrieve user from database: " + err.Error(),
			})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Success: true, Message: "User retrieved successfully", Data: user})
}

func (h *userHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	log := logger.Get()
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.Unauthorized,
				Message:   "Unauthorized to delete user account",
			})
		return
	}

	if err := h.repo.DeleteUser(userID); err != nil {
		log.Printf("Error deleting user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to delete user account"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Success: true, Message: "User deleted successfully"})
}

func (h *userHandler) RegisterRoutes(r *router.Router) {
	// Auth routes (no prefix needed as they're top-level)
	auth := r.Group("")
	auth.Handle("/register", h.RegisterUser, "POST")
	auth.Handle("/login", h.LoginUser, "POST")
	auth.Handle("/checkemail", h.CheckEmailExists, "GET")

	// User routes
	//    public := r.Group("/user")
	authorized := r.Group("/user", middleware.Auth)
	authorized.Handle("", h.GetUser, "GET")
	authorized.Handle("", h.UpdateUser, "PUT")
	authorized.Handle("", h.DeleteUser, "DELETE")
}
