package handlers

import (
	httperr "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"algolearn/pkg/security"
	"errors"
	"fmt"
	"strconv"

	"encoding/json"
	"net/http"
	"regexp"
	"time"

	"database/sql"

	"github.com/gin-gonic/gin"
)

type UserHandler interface {
	CheckEmailExists(c *gin.Context)
	RegisterUser(c *gin.Context)
	LoginUser(c *gin.Context)
	RefreshToken(c *gin.Context)
	UpdateUser(c *gin.Context)
	GetUser(c *gin.Context)
	GetUsers(c *gin.Context)
	DeleteUser(c *gin.Context)
	GetUsersCount(c *gin.Context)
	GetReceivedAchievementsCount(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
}

type userHandler struct {
	repo service.UserService
	log  *logger.Logger
}

func NewUserHandler(repo service.UserService) UserHandler {
	return &userHandler{repo: repo, log: logger.Get()}
}

func (h *userHandler) ValidateEmail(email string) bool {
	const emailRegex = `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`
	re := regexp.MustCompile(emailRegex)
	return re.MatchString(email)
}

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
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: httperr.DatabaseFail,
				Message:   "failed to check if email exists",
			})
		return
	}

	message := "email is available"
	if exists {
		message = "an account with this email already exists"
	}

	c.JSON(http.StatusOK,
		models.Response{
			Success: true,
			Message: message,
			Payload: models.EmailCheckResponse{
				Exists: exists,
			},
		})
}

func (h *userHandler) RegisterUser(c *gin.Context) {
	ctx := c.Request.Context()
	log := h.log.WithBaseFields(logger.Handler, "RegisterUser")
	var req models.RegistrationRequest
	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		c.JSON(http.StatusBadRequest,
			models.Response{Success: false,
				ErrorCode: httperr.InvalidJson,
				Message:   "invalid JSON"})
		return
	}

	if isValid, message := h.validateRegistrationInput(req); !isValid {
		c.JSON(http.StatusBadRequest,
			models.Response{Success: false,
				ErrorCode: httperr.InvalidFormData,
				Message:   message,
			})
		return
	}

	// Check if user with email already exists
	emailExists, err := h.repo.CheckEmailExists(ctx, req.Email)
	if err != nil {
		log.WithError(err).Error("failed to check if email exists")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.DatabaseFail,
			Message:   "failed to check if email exists",
		})
		return
	}

	if emailExists {
		c.JSON(http.StatusAccepted, models.Response{
			Success:   false,
			ErrorCode: httperr.AccountExists,
			Message:   "an account with this email already exists"})
		return
	}

	hashedPassword, err := security.HashPassword(req.Password)
	if err != nil {
		log.WithError(err).Error("error hashing password")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: httperr.InternalError,
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

	newUser, err := h.repo.CreateUser(ctx, user)
	if err != nil {
		log.WithError(err).Error("failed to create user")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.InternalError,
			Message:   "failed to create user",
		})
		return
	}

	token, err := security.GenerateJWT(newUser.ID)
	if err != nil {
		log.WithError(err).Error("failed to generate JWT")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: httperr.InternalError,
				Message:   "internal server error",
			})
		return
	}

	refreshToken, err := security.GenerateRefreshToken(newUser.ID)
	if err != nil {
		log.WithError(err).Error("failed to generate JWT")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: httperr.InternalError,
				Message:   "failed to generate refresh token",
			})
		return
	}

	response := models.Response{
		Success: true,
		Message: "user created successfully",
		Payload: models.AuthResponse{
			Token:        token,
			RefreshToken: refreshToken,
			User:         *newUser,
		},
	}

	c.JSON(http.StatusCreated, response)
}

func (h *userHandler) LoginUser(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "LoginUser")
	var req models.LoginRequest
	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidJson,
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
				ErrorCode: httperr.InvalidCredentials,
				Message:   "invalid email or password",
			})
		return
	}

	if !security.CheckPasswordHash(req.Password, user.PasswordHash) {
		log.Printf("login failed for user %s: invalid password", req.Email)
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidCredentials,
			Message:   "invalid email or password",
		})
		return
	}

	// Generate access token
	accessToken, err := security.GenerateJWT(user.ID)
	if err != nil {
		log.WithError(err).Error("Failed to generate access token")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.InternalError,
			Message:   "Failed to generate authentication token",
		})
		return
	}

	// Generate refresh token
	refreshToken, err := security.GenerateRefreshToken(user.ID)
	if err != nil {
		log.WithError(err).Error("Failed to generate refresh token")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.InternalError,
			Message:   "Failed to generate refresh token",
		})
		return
	}

	log.Debugf("Login successful for user ID: %d, tokens generated", user.ID)
	response := models.Response{
		Success: true,
		Message: "Login successful",
		Payload: models.AuthResponse{
			Token:        accessToken,
			RefreshToken: refreshToken,
			User:         *user,
		},
	}

	c.JSON(http.StatusOK, response)
}

func (h *userHandler) RefreshToken(c *gin.Context) {
	log := h.log.WithBaseFields(logger.Handler, "RefreshToken")
	var req models.RefreshTokenRequest
	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidJson,
			Message:   "invalid JSON",
		})
		return
	}

	// Validate refresh token
	claims, err := security.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		log.WithError(err).Warn("Invalid refresh token")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.InvalidToken,
			Message:   "Invalid or expired refresh token",
		})
		return
	}

	// Get user data
	user, err := h.repo.GetUserByID(c.Request.Context(), claims.UserID)
	if err != nil {
		log.WithError(err).Error("Failed to get user data during token refresh")
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.AccountNotFound,
			Message:   "User account not found",
		})
		return
	}

	// Generate new access token
	accessToken, err := security.GenerateJWT(claims.UserID)
	if err != nil {
		log.WithError(err).Error("Failed to generate new access token")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.InternalError,
			Message:   "Failed to generate new access token",
		})
		return
	}

	// Generate new refresh token
	newRefreshToken, err := security.GenerateRefreshToken(claims.UserID)
	if err != nil {
		log.WithError(err).Error("Failed to generate new refresh token")
		c.JSON(http.StatusInternalServerError, models.Response{
			Success:   false,
			ErrorCode: httperr.InternalError,
			Message:   "Failed to generate new refresh token",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Tokens refreshed successfully",
		Payload: models.AuthResponse{
			Token:        accessToken,
			RefreshToken: newRefreshToken,
			User:         *user,
		},
	})
}

func (h *userHandler) UpdateUser(c *gin.Context) {
	ctx := c.Request.Context()
	log := h.log.WithBaseFields(logger.Handler, "UpdateUser")
	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: httperr.Unauthorized,
				Message:   "you are not authorized to update the user's account",
			})
		return
	}

	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		log.WithError(err).Error("invalid JSON was sent in the request")
		c.JSON(http.StatusBadRequest,
			models.Response{
				Success:   false,
				ErrorCode: httperr.InvalidJson,
				Message:   fmt.Sprintf("invalid JSON was sent in the request: %s", err.Error()),
			})
		return
	}

	user.ID = userID
	if err := h.repo.UpdateUser(ctx, &user); err != nil {
		log.WithError(err).Error("failed to update user")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: httperr.DatabaseFail,
				Message:   "failed to update user in database",
			})
		return
	}

	updatedUser, err := h.repo.GetUserByID(ctx, user.ID)
	if err != nil {
		log.WithError(err).Error("failed to fetch updated user")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: httperr.InternalError,
				Message:   "failed to fetch updated user data",
			})
		return
	}

	c.JSON(http.StatusOK,
		models.Response{
			Success: true,
			Message: "user updated successfully",
			Payload: updatedUser,
		})
}

func (h *userHandler) GetUser(c *gin.Context) {
	ctx := c.Request.Context()
	log := h.log.WithBaseFields(logger.Handler, "GetUser")
	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{
			Success:   false,
			ErrorCode: httperr.Unauthorized,
			Message:   "unauthorized to retrieve user account",
		})
		return
	}

	user, err := h.repo.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.WithError(err).Warn("user not found in database")
			c.JSON(http.StatusNotFound,
				models.Response{
					Success:   false,
					ErrorCode: httperr.AccountNotFound,
					Message:   "user account not found",
				})
			return
		}
		log.WithError(err).Error("failed to retrieve user from database")
		c.JSON(http.StatusInternalServerError,
			models.Response{
				Success:   false,
				ErrorCode: httperr.DatabaseFail,
				Message:   "failed to retrieve user from database",
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

func (h *userHandler) GetUsers(c *gin.Context) {
	ctx := c.Request.Context()
	log := h.log.WithBaseFields(logger.Handler, "GetUsers")

	page, err := strconv.Atoi(c.Query("page"))
	if err != nil {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.Query("pageSize"))
	if err != nil {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{Success: false, Message: "Unauthorized"})
		return
	}

	user, err := h.repo.GetUserByID(ctx, userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.Response{Success: false, Message: "Unauthorized"})
		return
	}

	if user.Role != "admin" && user.Role != "instructor" {
		c.JSON(http.StatusUnauthorized, models.Response{Success: false, Message: "Unauthorized"})
		return
	}

	filters, err := models.ParseUserFilters(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "Invalid filter format"})
		return
	}

	sort := c.Query("sort")
	order := c.Query("order")

	users, err := h.repo.GetUsers(ctx, service.GetUsersParams{
		Username:        filters.Username,
		Email:           filters.Email,
		Role:            filters.Role,
		FirstName:       filters.FirstName,
		LastName:        filters.LastName,
		Location:        filters.Location,
		Bio:             filters.Bio,
		MinCpus:         models.SafeInt32(filters.MinCPUs),
		MaxCpus:         models.SafeInt32(filters.MaxCPUs),
		IsActive:        filters.IsActive,
		IsEmailVerified: filters.IsEmailVerified,
		CreatedAfter:    models.SafeTime(filters.CreatedAfter),
		CreatedBefore:   models.SafeTime(filters.CreatedBefore),
		UpdatedAfter:    models.SafeTime(filters.UpdatedAfter),
		UpdatedBefore:   models.SafeTime(filters.UpdatedBefore),
		LastLoginAfter:  models.SafeTime(filters.LastLoginAfter),
		LastLoginBefore: models.SafeTime(filters.LastLoginBefore),
		PageOffset:      int32(offset),
		PageLimit:       int32(pageSize),
		Sort:            sort,
		Order:           order,
	})
	if err != nil {
		log.WithError(err).Error("failed to get users")
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to get users"})
		return
	}

	// Get total count for pagination
	totalCount, err := h.repo.GetUsersCount(ctx)
	if err != nil {
		log.WithError(err).Error("failed to get total users count")
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to get total users count"})
		return
	}

	totalPages := (int(totalCount) + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, models.Response{Success: true, Message: "Users retrieved successfully", Payload: models.PaginatedPayload{
		Items: users,
		Pagination: models.Pagination{
			CurrentPage: page,
			PageSize:    pageSize,
			TotalItems:  totalCount,
			TotalPages:  totalPages,
		},
	}})
}

func (h *userHandler) GetUsersCount(c *gin.Context) {
	ctx := c.Request.Context()
	count, err := h.repo.GetUsersCount(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to get users count"})
		return
	}
	c.JSON(http.StatusOK, models.Response{Success: true, Message: "users count retrieved successfully", Payload: count})
}

func (h *userHandler) DeleteUser(c *gin.Context) {
	ctx := c.Request.Context()
	log := h.log.WithBaseFields(logger.Handler, "DeleteUser")
	userID, err := GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized,
			models.Response{
				Success:   false,
				ErrorCode: httperr.Unauthorized,
				Message:   "unauthorized to delete user account",
			})
		return
	}

	if err := h.repo.DeleteUser(ctx, userID); err != nil {
		log.WithError(err).Error("failed to delete user")
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to delete user account"})
		return
	}

	c.JSON(http.StatusOK, models.Response{Success: true, Message: "user deleted successfully"})
}

func (h *userHandler) GetReceivedAchievementsCount(c *gin.Context) {
	ctx := c.Request.Context()

	count, err := h.repo.GetReceivedAchievementsCount(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to get user achievements count"})
		return
	}

	c.JSON(http.StatusOK, models.Response{Success: true, Message: "user achievements count retrieved successfully", Payload: count})
}

func (h *userHandler) RegisterRoutes(r *gin.RouterGroup) {
	// Route Groups
	users := r.Group("/users")
	authorized := users.Group("", middleware.Auth())

	// Public routes
	users.GET("/achievements/count", h.GetReceivedAchievementsCount)
	users.POST("/sign-up", h.RegisterUser)
	users.POST("/sign-in", h.LoginUser)
	users.GET("/check-email", h.CheckEmailExists)
	users.POST("/refresh-token", h.RefreshToken)

	// Protected routes (require authentication)
	authorized.GET("", h.GetUsers)
	authorized.GET("/me", h.GetUser)
	authorized.GET("/count", h.GetUsersCount)
	authorized.PUT("/me", h.UpdateUser)
	// authorized.PUT("/me/preferences", h.UpdateUserPreferences)
}
