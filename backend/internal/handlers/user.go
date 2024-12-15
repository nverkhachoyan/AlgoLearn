package handlers

import (
	"algolearn/internal/config"
	"algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"algolearn/pkg/security"
	"context"

	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"regexp"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserHandler interface {
	CheckEmailExists(c *gin.Context)
	RegisterUser(c *gin.Context)
	LoginUser(c *gin.Context)
	// UpdateUser(w http.ResponseWriter, r *http.Request)
	GetUser(c *gin.Context)
	DeleteUser(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
}

type userHandler struct {
	repo service.UserService
}

func NewUserHandler(repo service.UserService) UserHandler {
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

func (h *userHandler) CheckEmailExists(c *gin.Context) {
	log := logger.Get().WithBaseFields(logger.Handler, "CheckEmailExists")
	ctx := c.Request.Context()
	email := c.Query("email")

	exists, err := h.repo.CheckEmailExists(ctx, email)
	if err != nil {
		log.WithError(err).Error("failed to check if email exists")
		c.JSON(http.StatusAccepted,
			models.Response{
				Success:   true,
				ErrorCode: errors.DatabaseFail,
				Message:   "failed to check if email exists",
			})
		return
	}

	if exists {
		c.JSON(http.StatusAccepted,
			models.Response{
				Success:   true,
				ErrorCode: errors.AccountExists,
				Message:   "an account with this email already exists",
			})
		return
	}

	c.JSON(http.StatusOK,
		models.Response{
			Success:   false,
			ErrorCode: errors.NoData,
			Message:   "an account with this email does not exist",
		})
}

func (h *userHandler) RegisterUser(c *gin.Context) {
	ctx := context.Background()
	log := logger.Get()
	var req models.RegistrationRequest
	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		c.JSON(http.StatusBadRequest,
			models.Response{Success: false,
				ErrorCode: errors.InvalidJson,
				Message:   "invalid JSON"})
		return
	}

	if isValid, message := h.validateRegistrationInput(req); !isValid {
		c.JSON(http.StatusBadRequest,
			models.Response{Success: false,
				ErrorCode: errors.InvalidFormData,
				Message:   message,
			})
		return
	}

	// Check if user with email already exists
	emailExists, _ := h.repo.CheckEmailExists(ctx, req.Email)

	if emailExists {
		c.JSON(http.StatusAccepted, models.Response{
			Success:   false,
			ErrorCode: errors.AccountExists,
			Message:   "an account with this email already exists"})
		return
	}

	hashedPassword, err := security.HashPassword(req.Password)
	if err != nil {
		log.Errorf("error hashing password: %v\n", err)
		c.JSON(http.StatusInternalServerError,
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
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: errors.InternalError,
			Message:   "Failed to create user",
		})
		return
	}

	token, err := security.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		c.JSON(http.StatusInternalServerError,
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

	c.JSON(http.StatusCreated, response)
}

func (h *userHandler) LoginUser(c *gin.Context) {
	log := logger.Get()
	var req models.LoginRequest
	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{Success: false, ErrorCode: errors.InvalidJson, Message: "Invalid JSON"})
		return
	}

	user, err := h.repo.GetUserByEmail(c.Request.Context(), req.Email)
	if err != nil {
		log.Printf("Login failed for user %s: %v", req.Email, err)
		c.JSON(http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.InvalidCredentials,
				Message:   "Invalid email or password",
			})
		return
	}

	if !security.CheckPasswordHash(req.Password, user.PasswordHash) {
		log.Printf("Login failed for user %s: invalid password", req.Email)
		log.Printf("Provided password: %s", req.Password)
		log.Printf("Stored hash: %s", user.PasswordHash)
		c.JSON(http.StatusUnauthorized, models.Response{Success: false, ErrorCode: errors.InvalidCredentials, Message: "Invalid email or password"})
		return
	}

	token, err := security.GenerateJWT(user.ID)
	if err != nil {
		log.Printf("Error generating token for user %s: %v", req.Email, err)
		c.JSON(http.StatusInternalServerError,
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

	c.JSON(http.StatusOK, response)
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

func (h *userHandler) UpdateUser(c *gin.Context) {
	log := logger.Get()
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.Unauthorized,
				Message:   "You are not authorized to update the user's account",
			})
		return
	}

	// Parse multipart form
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil { // 10 MB
		c.JSON(http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: errors.InvalidFormData,
				Message:   "Invalid Form Data was sent in the request",
			})
		return
	}

	var user models.User
	jsonData := c.Request.FormValue("data")
	if err := json.Unmarshal([]byte(jsonData), &user); err != nil {
		c.JSON(http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: errors.InvalidJson,
				Message:   "Invalid JSON was sent in the request",
			})
		return
	}

	user.ID = int32(userID.(int64))
	user.UpdatedAt = time.Now()

	file, _, err := c.Request.FormFile("avatar")
	if err == nil {
		defer file.Close()
		s3Session := config.GetS3Sesssion()
		avatarURL, err := uploadUserAvatarToS3(s3Session, file, user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError,
				models.Response{
					Success:   false,
					ErrorCode: errors.FileUploadFailed,
					Message:   "File upload to S3 object storage has failed",
				})
			return
		}
		user.ProfilePictureURL = avatarURL
	} else if err != http.ErrMissingFile {
		c.JSON(http.StatusInternalServerError,
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
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.DatabaseFail,
				Message:   fmt.Sprintf("failed to update user: %s", err.Error()),
			})
		return
	}

	newUserData, err := h.repo.GetUserByID(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.InternalError,
				Message:   "Failed to fetch the user that was updated",
			})
		return
	}

	c.JSON(http.StatusOK, models.Response{Success: true, Message: "User updated successfully", Data: newUserData})
}

func (h *userHandler) GetUser(c *gin.Context) {
	log := logger.Get()
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized,
			models.Response{Success: false,
				ErrorCode: errors.Unauthorized,
				Message:   "Unauthorized to retrieve user account",
			})
		return
	}

	user, err := h.repo.GetUserByID(int32(userID.(int64)))
	if err != nil {
		log.Printf("Error retrieving user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.DatabaseFail,
				Message:   "Failed to retrieve user from database: " + err.Error(),
			})
		return
	}

	c.JSON(http.StatusOK, models.Response{Success: true, Message: "User retrieved successfully", Data: user})
}

func (h *userHandler) DeleteUser(c *gin.Context) {
	log := logger.Get()
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.Unauthorized,
				Message:   "Unauthorized to delete user account",
			})
		return
	}

	if err := h.repo.DeleteUser(int32(userID.(int64))); err != nil {
		log.Printf("Error deleting user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to delete user account"})
		return
	}

	c.JSON(http.StatusOK, models.Response{Success: true, Message: "User deleted successfully"})
}

func (h *userHandler) RegisterRoutes(r *gin.RouterGroup) {
	// Auth routes (no prefix needed as they're top-level)
	auth := r.Group("")
	auth.POST("/register", h.RegisterUser)
	auth.POST("/login", h.LoginUser)
	auth.GET("/checkemail", h.CheckEmailExists)

	// User routes
	//    public := r.Group("/user")
	authorized := r.Group("/user", middleware.Auth())
	authorized.GET("", h.GetUser)
	authorized.PUT("", h.UpdateUser)
	authorized.DELETE("", h.DeleteUser)
}
