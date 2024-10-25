package config

import (
	"algolearn/pkg/logger"
	"database/sql"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	_ "github.com/lib/pq"
	"golang.org/x/oauth2"
)

var (
	db *sql.DB

	googleOauthConfig *oauth2.Config
	appleOauthConfig  *oauth2.Config
	s3Session         *s3.S3
)

var (
	googleEndpoint = oauth2.Endpoint{
		AuthURL:  "https://accounts.google.com/o/oauth2/auth",
		TokenURL: "https://accounts.google.com/o/oauth2/token",
	}

	appleEndpoint = oauth2.Endpoint{
		AuthURL:  "https://appleid.apple.com/auth/authorize",
		TokenURL: "https://appleid.apple.com/auth/token",
	}
)

func InitDB() {
	log := logger.Get()
	var err error

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName,
	)

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database: %v\n", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Error connecting to the database: %v\n", err)
	}

	log.Println("Connected to the database successfully")
}

func InitOAuth() {
	log := logger.Get()

	googleOauthConfig = &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Endpoint:     googleEndpoint,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
	}

	appleOauthConfig = &oauth2.Config{
		ClientID:     os.Getenv("APPLE_CLIENT_ID"),
		ClientSecret: os.Getenv("APPLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("APPLE_REDIRECT_URL"),
		Endpoint:     appleEndpoint,
		Scopes:       []string{"name", "email"},
	}

	log.Println("OAuth configurations initialized successfully")
}

func InitS3() {
	log := logger.Get()

	sess, err := session.NewSession(&aws.Config{
		Region:           aws.String(os.Getenv("SPACES_REGION")),
		Endpoint:         aws.String(os.Getenv("SPACES_ENDPOINT")),
		Credentials:      credentials.NewStaticCredentials(os.Getenv("SPACES_ACCESS_KEY"), os.Getenv("SPACES_SECRET_KEY"), ""),
		S3ForcePathStyle: aws.Bool(true), // Migth be necessary for DigitalOcean Spaces
	})
	if err != nil {
		log.Fatalf("Unable to create AWS session: %v", err)
	}

	s3Session = s3.New(sess)
	log.Println("S3 session initialized successfully")
}

func GetDB() *sql.DB {
	return db
}

func GetGoogleOAuthConfig() *oauth2.Config {
	return googleOauthConfig
}

func GetAppleOAuthConfig() *oauth2.Config {
	return appleOauthConfig
}

func GetS3Sesssion() *s3.S3 {
	return s3Session
}
