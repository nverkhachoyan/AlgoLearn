package config

import (
	"algolearn/pkg/logger"
	"database/sql"
	"fmt"

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

func InitDB(cfg DatabaseConfig) {
	log := logger.Get()
	var err error

	dbHost := cfg.Host
	dbPort := cfg.Port
	dbUser := cfg.User
	dbPassword := cfg.Password
	dbName := cfg.Name

	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
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

func InitOAuth(cfg OAuthConfig) {
	log := logger.Get()

	googleOauthConfig = &oauth2.Config{
		ClientID:     cfg.Google.ClientID,
		ClientSecret: cfg.Google.ClientSecret,
		RedirectURL:  cfg.Google.RedirectURL,
		Endpoint:     googleEndpoint,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
	}

	appleOauthConfig = &oauth2.Config{
		ClientID:     cfg.Apple.ClientID,
		ClientSecret: cfg.Apple.ClientSecret,
		RedirectURL:  cfg.Apple.RedirectURL,
		Endpoint:     appleEndpoint,
		Scopes:       []string{"name", "email"},
	}

	log.Println("OAuth configurations initialized successfully")
}

func InitS3(cfg StorageConfig) {
	log := logger.Get()

	sess, err := session.NewSession(&aws.Config{
		Region:           aws.String(cfg.SpacesRegion),
		Endpoint:         aws.String(cfg.SpacesEndpoint),
		Credentials:      credentials.NewStaticCredentials(cfg.SpacesAccessKey, cfg.SpacesSecretKey, ""),
		S3ForcePathStyle: aws.Bool(true), // Migth be necessary for DigitalOcean Spaces
	})
	if err != nil {
		log.Fatalf("unable to create AWS session: %v", err)
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
