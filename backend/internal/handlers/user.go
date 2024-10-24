// internal/handlers/user.go
package handlers

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/errors"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/router"
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
	"github.com/gorilla/mux"
)

type UserHandler interface {
	CheckEmailExists(w http.ResponseWriter, r *http.Request)
	RegisterUser(w http.ResponseWriter, r *http.Request)
	LoginUser(w http.ResponseWriter, r *http.Request)
	UpdateUser(w http.ResponseWriter, r *http.Request)
	GetUser(w http.ResponseWriter, r *http.Request)
	DeleteUser(w http.ResponseWriter, r *http.Request)
	// GetAllUsers(w http.ResponseWriter, r *http.Request)
	// ChangeUserPassword(w http.ResponseWriter, r *http.Request) TODO: implement
	GetAllUserAchievements(w http.ResponseWriter, r *http.Request)
	// GetUserAchievementsByUserID(w http.ResponseWriter, r *http.Request)
	GetUserAchievementByID(w http.ResponseWriter, r *http.Request)
	CreateUserAchievement(w http.ResponseWriter, r *http.Request)
	// UpdateUserAchievement(w http.ResponseWriter, r *http.Request)
	DeleteUserAchievement(w http.ResponseWriter, r *http.Request)
	// GetStreaksByUserID(w http.ResponseWriter, r *http.Request)
	GetAllStreaks(w http.ResponseWriter, r *http.Request)
	// GetStreakByID(w http.ResponseWriter, r *http.Request)
	// CreateStreak(w http.ResponseWriter, r *http.Request)
	// UpdateStreak(w http.ResponseWriter, r *http.Request)
	// DeleteStreak(w http.ResponseWriter, r *http.Request)
	// GetUserModuleProgressByUserID(w http.ResponseWriter, r *http.Request)
	// GetUserModuleProgressByID(w http.ResponseWriter, r *http.Request)
	CreateUserModuleProgress(w http.ResponseWriter, r *http.Request)
	UpdateUserModuleProgress(w http.ResponseWriter, r *http.Request)
	DeleteUserModuleProgress(w http.ResponseWriter, r *http.Request)
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
	email := r.URL.Query().Get("email")

	user, _ := h.repo.GetUserByEmail(email)
	if user != nil {
		RespondWithJSON(w, http.StatusAccepted,
			models.Response{
				Status:    "success",
				ErrorCode: errors.ACCOUNT_EXISTS,
				Message:   "An account with this email already exists",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK,
		models.Response{
			Status:    "error",
			ErrorCode: errors.NO_DATA,
			Message:   "An account with this email does not exist",
		})
}

func (h *userHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var req models.RegistrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{Status: "error",
				ErrorCode: errors.INVALID_JSON,
				Message:   "invalid JSON"})
		return
	}

	if isValid, message := h.validateRegistrationInput(req); !isValid {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{Status: "error",
				ErrorCode: errors.INVALID_FORM_DATA,
				Message:   message,
			})
		return
	}

	// Check if user with email already exists
	userByEmail, _ := h.repo.GetUserByEmail(req.Email)

	if userByEmail != nil {
		RespondWithJSON(w, http.StatusAccepted, models.Response{Status: "error", ErrorCode: errors.ACCOUNT_EXISTS, Message: "an account with this email already exists"})
		return
	}

	hashedPassword, err := services.HashPassword(req.Password)
	if err != nil {
		config.Log.Errorf("error hashing password: %v\n", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INTERNAL_ERROR,
				Message:   "internal server error",
			})
		return
	}

	user := &models.User{
		BaseModel: models.BaseModel{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Username:        req.Username,
		Email:           req.Email,
		PasswordHash:    hashedPassword,
		Role:            "admin",
		IsActive:        true,
		IsEmailVerified: false,
		CPUs:            0,
		Preferences:     `{}`,
	}

	if err := h.repo.CreateUser(user); err != nil {
		log.Printf("Error creating user: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			ErrorCode: errors.INTERNAL_ERROR,
			Message:   "Failed to create user",
		})
		return
	}

	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INTERNAL_ERROR,
				Message:   "Internal server error",
			})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User created successfully",
		Data:    map[string]interface{}{"token": token},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func (h *userHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", ErrorCode: errors.INVALID_JSON, Message: "Invalid JSON"})
		return
	}

	user, err := h.repo.GetUserByEmail(req.Email)
	if err != nil {
		log.Printf("Login failed for user %s: %v", req.Email, err)
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_CREDENTIALS,
				Message:   "Invalid email or password",
			})
		return
	}

	if !services.CheckPasswordHash(req.Password, user.PasswordHash) {
		log.Printf("Login failed for user %s: invalid password", req.Email)
		log.Printf("Provided password: %s", req.Password)
		log.Printf("Stored hash: %s", user.PasswordHash)
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", ErrorCode: errors.INVALID_CREDENTIALS, Message: "Invalid email or password"})
		return
	}

	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("Error generating token for user %s: %v", req.Email, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INTERNAL_ERROR,
				Message:   "Internal server error",
			})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "Logged in successfully",
		Data:    map[string]interface{}{"token": token},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func uploadUserAvatarToS3(s3Session *s3.S3, file multipart.File, userID int64) (string, error) {
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
	tokenStr := strings.Split(r.Header.Get("Authorization"), " ")[1]
	if tokenStr == "" {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "You are not authorized to update the user's account",
			})
		return
	}

	claims, err := services.ValidateJWT(tokenStr)
	if err != nil {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "You are not authorized to make that request",
			})
		return
	}

	userID := int64(claims.UserID)

	// Parsing multipart form data
	err = r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_FORM_DATA,
				Message:   "Invalid Form Data was sent in the request",
			})
		return
	}

	var user models.User
	jsonData := r.FormValue("data")
	if err := json.Unmarshal([]byte(jsonData), &user); err != nil {
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INVALID_JSON,
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
					Status:    "error",
					ErrorCode: errors.FILE_UPLOAD_FAILED,
					Message:   "File upload to S3 object storage has failed",
				})
			return
		}
		user.ProfilePictureURL = avatarURL
	} else if err != http.ErrMissingFile {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.FILE_UPLOAD_FAILED,
				Message:   "Error while processing avatar upload, but file is not missing, it's likely something else",
			})
		return
	}

	log.Printf("Updating user data: %+v\n", user)

	if err := h.repo.UpdateUser(&user); err != nil {
		log.Printf("Error updating user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
				Message:   "Failed to update the user table in the database, likely issue with repository function, or database is down",
			})
		return
	}

	newUserData, err := h.repo.GetUserByID(userID)

	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.INTERNAL_ERROR,
				Message:   "Failed to fetch the user that was updated",
			})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User updated successfully", Data: newUserData})
}

func (h *userHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{Status: "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Unauthorized to retrieve user account",
			})
		return
	}

	user, err := h.repo.GetUserByID(userID)
	if err != nil {
		log.Printf("Error retrieving user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError,
			models.Response{
				Status:    "error",
				ErrorCode: errors.DATABASE_FAIL,
				Message:   "Failed to retrieve user from database: " + err.Error(),
			})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User retrieved successfully", Data: user})
}

func (h *userHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized,
			models.Response{
				Status:    "error",
				ErrorCode: errors.UNAUTHORIZED,
				Message:   "Unauthorized to delete user account",
			})
		return
	}

	if err := h.repo.DeleteUser(userID); err != nil {
		log.Printf("Error deleting user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete user account"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User deleted successfully"})
}

// *** USER ACHIEVEMENTS HANDLERS ***
func (h *userHandler) GetAllUserAchievements(w http.ResponseWriter, r *http.Request) {
	userAchievements, err := h.repo.GetAllUserAchievements()
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Internal server error"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User achievements retrieved successfully",
		Data:    map[string]interface{}{"user_achievements": userAchievements},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func (h *userHandler) GetUserAchievementByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid user achievement ID"})
		return
	}

	userAchievement, err := h.repo.GetUserAchievementByID(id)
	if err != nil {
		RespondWithJSON(w, http.StatusNotFound, models.Response{Status: "error", Message: "User achievement not found"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User achievement retrieved successfully",
		Data:    map[string]interface{}{"user_achievement": userAchievement},
	}

	RespondWithJSON(w, http.StatusOK, response)
}

func (h *userHandler) CreateUserAchievement(w http.ResponseWriter, r *http.Request) {
	var userAchievement models.UserAchievement
	err := json.NewDecoder(r.Body).Decode(&userAchievement)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid request payload"})
		return
	}

	err = h.repo.CreateUserAchievement(&userAchievement)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to create user achievement"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User achievement created successfully",
		Data:    map[string]interface{}{"user_achievement": userAchievement},
	}

	RespondWithJSON(w, http.StatusCreated, response)
}

func (h *userHandler) DeleteUserAchievement(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid user achievement ID"})
		return
	}

	err = h.repo.DeleteUserAchievement(id)
	if err != nil {
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Failed to delete user achievement"})
		return
	}

	response := models.Response{
		Status:  "success",
		Message: "User achievement deleted successfully",
	}

	RespondWithJSON(w, http.StatusOK, response)
}

// *** USER MODULE PROGRESS ***

func (h *userHandler) GetAllUserModuleProgress(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	sessions, err := h.repo.GetUserModuleProgressByUserID(userID)
	if err != nil {
		log.Printf("Error fetching user_module_sessions for user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve user_module_sessions"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User module sessions retrieved successfully", Data: sessions})
}

func (h *userHandler) GetUserModuleProgressByID(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	session, err := h.repo.GetUserModuleProgressByID(id, userID)
	if err != nil {
		log.Printf("Error fetching user_module_session %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve user_module_session"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User module session retrieved successfully", Data: session})
}

func (h *userHandler) CreateUserModuleProgress(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	var progress models.UserModuleProgress
	if err := json.NewDecoder(r.Body).Decode(&progress); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}
	progress.UserID = userID

	if err := h.repo.CreateUserModuleProgress(&progress); err != nil {
		log.Printf("Error creating user_module_session for user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not create user_module_session"})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{Status: "success", Message: "User module session created successfully", Data: progress})
}

func (h *userHandler) UpdateUserModuleProgress(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	var progress models.UserModuleProgress
	if err := json.NewDecoder(r.Body).Decode(&progress); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid input"})
		return
	}

	// Ensure the session being updated is the one authenticated
	if progress.ID != id || progress.UserID != userID {
		RespondWithJSON(w, http.StatusForbidden, models.Response{Status: "error", Message: "Cannot update another user's session"})
		return
	}

	progress.ID = id
	progress.UserID = userID

	if err := h.repo.UpdateUserModuleProgress(&progress); err != nil {
		log.Printf("Error updating user_module_session %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not update user_module_session"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User module session updated successfully"})
}

func (h *userHandler) DeleteUserModuleProgress(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{Status: "error", Message: "Invalid session ID"})
		return
	}

	if err := h.repo.DeleteUserModuleProgress(id, userID); err != nil {
		log.Printf("Error deleting user_module_session %d for user %d: %v", id, userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not delete user_module_session"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "User module session deleted successfully"})
}

// **********************
// **** USER STREAKS ****
// **********************

func (h *userHandler) GetAllStreaks(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{Status: "error", Message: "Unauthorized"})
		return
	}

	streaks, err := h.repo.GetStreaksByUserID(userID)
	if err != nil {
		log.Printf("Error fetching streaks for user %d: %v", userID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{Status: "error", Message: "Could not retrieve streaks"})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{Status: "success", Message: "Streaks retrieved successfully", Data: streaks})
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

	// User achievements routes
	//    achievementsPublic := r.Group("/user_achievements")
	achievementsAuth := r.Group("/user_achievements", middleware.Auth)
	achievementsAuth.Handle("", h.GetAllUserAchievements, "GET")
	achievementsAuth.Handle("/{id}", h.GetUserAchievementByID, "GET")
	achievementsAuth.Handle("", h.CreateUserAchievement, "POST")
	achievementsAuth.Handle("/{id}", h.DeleteUserAchievement, "DELETE")

	// Streaks routes
	streaksAuth := r.Group("/streaks", middleware.Auth)
	streaksAuth.Handle("", h.GetAllStreaks, "GET")
}
