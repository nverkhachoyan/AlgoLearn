package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"algolearn/internal/config"
	"algolearn/internal/models"
	"algolearn/internal/service"
	"algolearn/pkg/security"

	"golang.org/x/oauth2"

	"github.com/gin-gonic/gin"
)

type OauthHandler interface {
	HandleOAuthLogin(c *gin.Context)
	GoogleCallback(c *gin.Context)
	AppleCallback(c *gin.Context)
	RegisterRoutes(r *gin.RouterGroup)
}

type oauthHandler struct {
	userRepo service.UserService
}

func NewOauthHandler(userRepo service.UserService) OauthHandler {
	return &oauthHandler{userRepo: userRepo}
}

func (h *oauthHandler) HandleOAuthLogin(c *gin.Context) {
	provider := c.Query("provider")
	state := c.Query("state")
	if state == "" {
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "State parameter is missing"})
		return
	}
	fmt.Printf("HandleOAuthLogin - State: %s\n", state) // Debugging state parameter
	var url string
	switch provider {
	case "google":
		url = config.GetGoogleOAuthConfig().AuthCodeURL(state, oauth2.AccessTypeOffline)
	case "apple":
		url = config.GetAppleOAuthConfig().AuthCodeURL(state, oauth2.AccessTypeOffline)
	default:
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "Unknown provider"})
		return
	}
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *oauthHandler) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	if state == "" {
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "State parameter is missing"})
		return
	}
	fmt.Printf("GoogleCallback - State: %s\n", state) // Debugging state parameter
	token, err := config.GetGoogleOAuthConfig().Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to exchange token: " + err.Error()})
		return
	}

	client := config.GetGoogleOAuthConfig().Client(context.Background(), token)
	response, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to get user info: " + err.Error()})
		return
	}
	defer response.Body.Close()

	var googleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(response.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to parse user info: " + err.Error()})
		return
	}

	h.handleOAuthUser(c, googleUser.Email, googleUser.ID, state)
}

func (h *oauthHandler) AppleCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	if state == "" {
		c.JSON(http.StatusBadRequest, models.Response{Success: false, Message: "State parameter is missing"})
		return
	}
	fmt.Printf("AppleCallback - State: %s\n", state) // Debugging state parameter
	token, err := config.GetAppleOAuthConfig().Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to exchange token: " + err.Error()})
		return
	}

	client := config.GetAppleOAuthConfig().Client(context.Background(), token)
	response, err := client.Get("https://appleid.apple.com/auth/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to get user info: " + err.Error()})
		return
	}
	defer response.Body.Close()

	var appleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(response.Body).Decode(&appleUser); err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to parse user info: " + err.Error()})
		return
	}

	h.handleOAuthUser(c, appleUser.Email, appleUser.ID, state)
}

func (h *oauthHandler) handleOAuthUser(c *gin.Context, email, oauthID, state string) {
	fmt.Printf("handleOAuthUser - State: %s\n", state) // Debugging state parameter
	user, err := h.userRepo.GetUserByEmail(c.Request.Context(), email)
	if err != nil {
		if err.Error() == "user not found" {
			// User does not exist, we create a new one
			newUser := &models.User{
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
				Email:           email,
				OAuthID:         oauthID,
				Role:            "user",
				IsActive:        true,
				IsEmailVerified: true,
				CPUs:            0,
			}
			_, err := h.userRepo.CreateUser(newUser)
			if err != nil {
				c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Could not create user: " + err.Error()})
				return
			}
			user = newUser
		} else {
			c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Database error: " + err.Error()})
			return
		}
	}

	token, err := security.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{Success: false, Message: "Failed to generate JWT: " + err.Error()})
		return
	}

	// Include the state parameter in the redirect URL
	c.Redirect(http.StatusTemporaryRedirect, "app.algolearn://auth?token="+token+"&state="+state)
}

func (h *oauthHandler) RegisterRoutes(r *gin.RouterGroup) {
	oauth := r.Group("/login/oauth")
	oauth.GET("", h.HandleOAuthLogin)

	callback := r.Group("/callback")
	callback.GET("/google", h.GoogleCallback)
	callback.GET("/apple", h.AppleCallback)
}
