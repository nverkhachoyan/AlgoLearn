package auth

import (
	"context"
	"golang.org/x/oauth2"
	"net/http"
)

var (
	oauth2Config *oauth2.Config
)

func SetupOAuth2() {
	oauth2Config = &oauth2.Config{
		ClientID:     "client-id",
		ClientSecret: "client-secret",
		RedirectURL:  "http://localhost:8080/callback",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://provider.com/o/oauth2/auth",
			TokenURL: "https://provider.com/o/oauth2/token",
		},
		Scopes: []string{"profile", "email"},
	}
}

func AuthHandler(w http.ResponseWriter, r *http.Request) {
	url := oauth2Config.AuthCodeURL("state")
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func CallbackHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	code := r.URL.Query().Get("code")
	token, err := oauth2Config.Exchange(ctx, code)
	if err != nil {
		http.Error(w, "Failed to exchange token", http.StatusInternalServerError)
		return
	}

	client := oauth2Config.Client(ctx, token)
	resp, err := client.Get("https://provider.com/userinfo")
	if err != nil {
		http.Error(w, "Failed to get user info", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// We process the user info here
	// ...
}
