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
	log  *logger.Logger
}

func NewUserHandler(repo service.UserService) UserHandler {
	return &userHandler{repo: repo, log: logger.Get()}
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
		return false, "username must be between 5 and 20 characters long"
	}
	if len(req.Password) < 8 {
		return false, "password must be at least 8 characters long"
	}
	if !h.ValidateEmail(req.Email) {
		return false, "invalid email format"
	}
	return true, ""
}

func (h *userHandler) CheckEmailExists(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "CheckEmailExists")
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
	log := h.log.WithBaseFields(logger.Handler, "RegisterUser")
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
		log.WithError(err).Error("error hashing password")
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
		log.WithError(err).Error("failed to create user")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: errors.InternalError,
			Message:   "failed to create user",
		})
		return
	}

	token, err := security.GenerateJWT(user.ID)
	if err != nil {
		log.WithError(err).Error("failed to generate JWT")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.InternalError,
				Message:   "internal server error",
			})
		return
	}

	response := models.Response{
		Success: true,
		Message: "user created successfully",
		Payload: map[string]interface{}{"token": token, "user": newUser},
	}

	c.JSON(http.StatusCreated, response)
}

func (h *userHandler) LoginUser(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "LoginUser")
	var req models.LoginRequest
	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: errors.InvalidJson,
			Message:   "invalid JSON",
		})
		return
	}

	user, err := h.repo.GetUserByEmail(c.Request.Context(), req.Email)
	if err != nil {
		log.WithError(err).Error("failed to get user by email")
		c.JSON(http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.InvalidCredentials,
				Message:   "invalid email or password",
			})
		return
	}

	if !security.CheckPasswordHash(req.Password, user.PasswordHash) {
		log.Printf("login failed for user %s: invalid password", req.Email)
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: errors.InvalidCredentials,
			Message:   "invalid email or password",
		})
		return
	}

	token, err := security.GenerateJWT(user.ID)
	if err != nil {
		log.WithError(err).Error("failed to generate JWT")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.InternalError,
				Message:   "internal server error",
			})
		return
	}

	response := models.Response{
		Success: true,
		Message: "logged in successfully",
		Payload: map[string]interface{}{"token": token, "user": user},
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
		return "", fmt.Errorf("error uploading to S3: %v", err)
	}

	avatarURL := fmt.Sprintf("https://%s/%s", "algolearn.sfo3.cdn.digitaloceanspaces.com", objectKey)
	return avatarURL, nil
}

func (h *userHandler) UpdateUser(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "UpdateUser")
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.Unauthorized,
				Message:   "you are not authorized to update the user's account",
			})
		return
	}

	// Parse multipart form
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil { // 10 MB
		log.WithError(err).Error("failed to parse multipart form")
		c.JSON(http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: errors.InvalidFormData,
				Message:   "invalid form data was sent in the request",
			})
		return
	}

	var user models.User
	jsonData := c.Request.FormValue("data")
	if err := json.Unmarshal([]byte(jsonData), &user); err != nil {
		log.WithError(err).Error("invalid JSON was sent in the request")
		c.JSON(http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: errors.InvalidJson,
				Message:   "invalid JSON was sent in the request",
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
			log.WithError(err).Error("failed to upload user avatar to S3")
			c.JSON(http.StatusInternalServerError,
				models.Response{
					Success:   false,
					ErrorCode: errors.FileUploadFailed,
					Message:   "file upload to S3 object storage has failed",
				})
			return
		}
		user.ProfilePictureURL = avatarURL
	} else if err != http.ErrMissingFile {
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.FileUploadFailed,
				Message:   "error while processing avatar upload, but file is not missing, it's likely something else",
			})
		return
	}

	log.Printf("Updating user data: %+v\n", user)

	if err := h.repo.UpdateUser(&user); err != nil {
		log.WithError(err).Error("failed to update user")
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
		log.WithError(err).Error("failed to fetch the user that was updated")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.InternalError,
				Message:   "failed to fetch the user that was updated",
			})
		return
	}

	c.JSON(http.StatusOK,
		models.Response{
			Success: true,
			Message: "user updated successfully",
			Payload: newUserData,
		})
}

func (h *userHandler) GetUser(c *gin.Context) {
	log := logger.Get()
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized,
			models.Response{Success: false,
				ErrorCode: errors.Unauthorized,
				Message:   "unauthorized to retrieve user account",
			})
		return
	}

	user, err := h.repo.GetUserByID(int32(userID.(int64)))
	if err != nil {
		log.WithError(err).Error("failed to retrieve user from database")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: errors.DatabaseFail,
				Message:   "failed to retrieve user from database: " + err.Error(),
			})
		return
	}

	c.JSON(http.StatusOK,
		models.Response{
			Success: true,
			Message: "user retrieved successfully",
			Payload: user,
		})
}

func (h *userHandler) DeleteUser(c *gin.Context) {
	log := logger.Get()
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: errors.Unauthorized,
				Message:   "unauthorized to delete user account",
			})
		return
	}

	if err := h.repo.DeleteUser(int32(userID.(int64))); err != nil {
		log.WithError(err).Error("failed to delete user")
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to delete user account"})
		return
	}

	c.JSON(http.StatusOK, models.Response{Success: true, Message: "User deleted successfully"})
}

func (h *userHandler) RegisterRoutes(r *gin.RouterGroup) {
	// Public routes
	users := r.Group("/users")
	users.POST("/register", h.RegisterUser)
	users.POST("/login", h.LoginUser)
	users.GET("/checkemail", h.CheckEmailExists)
	// users.POST("/refresh", h.RefreshToken)

	// Protected routes (require authentication)
	authorized := users.Group("", middleware.Auth())
	authorized.GET("/me", h.GetUser)
	authorized.PUT("/me", h.UpdateUser)
	// authorized.PUT("/me/preferences", h.UpdateUserPreferences)
}
