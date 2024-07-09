package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/services"

	"golang.org/x/oauth2"
)

func HandleOAuthLogin(w http.ResponseWriter, r *http.Request) {
	provider := r.URL.Query().Get("provider")
	state := r.URL.Query().Get("state")
	if state == "" {
		http.Error(w, "State parameter is missing", http.StatusBadRequest)
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
		http.Error(w, "Unknown provider", http.StatusBadRequest)
		return
	}
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func GoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	if state == "" {
		http.Error(w, "State parameter is missing", http.StatusBadRequest)
		return
	}
	fmt.Printf("GoogleCallback - State: %s\n", state) // Debugging state parameter
	token, err := config.GetGoogleOAuthConfig().Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	client := config.GetGoogleOAuthConfig().Client(context.Background(), token)
	response, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	var googleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(response.Body).Decode(&googleUser); err != nil {
		http.Error(w, "Failed to parse user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	handleOAuthUser(w, r, googleUser.Email, googleUser.ID, state)
}

func AppleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	if state == "" {
		http.Error(w, "State parameter is missing", http.StatusBadRequest)
		return
	}
	fmt.Printf("AppleCallback - State: %s\n", state) // Debugging state parameter
	token, err := config.GetAppleOAuthConfig().Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	client := config.GetAppleOAuthConfig().Client(context.Background(), token)
	response, err := client.Get("https://appleid.apple.com/auth/userinfo")
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	var appleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(response.Body).Decode(&appleUser); err != nil {
		http.Error(w, "Failed to parse user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	handleOAuthUser(w, r, appleUser.Email, appleUser.ID, state)
}

func handleOAuthUser(w http.ResponseWriter, r *http.Request, email, oauthID, state string) {
	fmt.Printf("handleOAuthUser - State: %s\n", state) // Debugging state parameter
	user, err := repository.GetUserByEmail(email)
	if err != nil {
		if err.Error() == "user not found" {
			// User does not exist, we create a new one
			newUser := &models.User{
				Email:           email,
				OAuthID:         oauthID,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
				Role:            "user",
				IsActive:        true,
				IsEmailVerified: true,
				CPUs:            0,
				Preferences:     `{}`,
			}
			if err := repository.CreateUser(newUser); err != nil {
				http.Error(w, "Could not create user: "+err.Error(), http.StatusInternalServerError)
				return
			}
			user = newUser
		} else {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		http.Error(w, "Failed to generate JWT: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Include the state parameter in the redirect URL
	http.Redirect(w, r, "app.algolearn://auth?token="+token+"&state="+state, http.StatusTemporaryRedirect)
}
