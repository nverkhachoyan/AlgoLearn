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
	db                *sql.DB
	googleOauthConfig *oauth2.Config
	appleOauthConfig  *oauth2.Config
	s3Session         *s3.S3
	s3BucketName      string
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

func Load() (*Config, error) {
	port := os.Getenv("PORT")
	if port == "" {
		return nil, fmt.Errorf("PORT environment variable is required")
	}

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		return nil, fmt.Errorf("DB_HOST environment variable is required")
	}

	dbPort := getEnvAsInt("DB_PORT", 0)
	if dbPort == 0 {
		return nil, fmt.Errorf("DB_PORT environment variable is required")
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		return nil, fmt.Errorf("DB_USER environment variable is required")
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		return nil, fmt.Errorf("DB_PASSWORD environment variable is required")
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		return nil, fmt.Errorf("DB_NAME environment variable is required")
	}

	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" {
		return nil, fmt.Errorf("DB_SSLMODE environment variable is required")

	}

	runMigrations := os.Getenv("RUN_MIGRATIONS")
	if runMigrations == "" {
		return nil, fmt.Errorf("RUN_MIGRATIONS environment variable is required")
	}

	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	if migrationsDir == "" {
		return nil, fmt.Errorf("MIGRATIONS_DIR environment variable is required")
	}

	spacesRegion := os.Getenv("SPACES_REGION")
	if spacesRegion == "" {
		return nil, fmt.Errorf("SPACES_REGION environment variable is required")
	}

	spacesEndpoint := os.Getenv("SPACES_ENDPOINT")
	if spacesEndpoint == "" {
		return nil, fmt.Errorf("SPACES_ENDPOINT environment variable is required")
	}

	spacesAccessKey := os.Getenv("SPACES_ACCESS_KEY")
	if spacesAccessKey == "" {
		return nil, fmt.Errorf("SPACES_ACCESS_KEY environment variable is required")
	}

	spacesSecretKey := os.Getenv("SPACES_SECRET_KEY")
	if spacesSecretKey == "" {
		return nil, fmt.Errorf("SPACES_SECRET_KEY environment variable is required")
	}

	spacesBucketName := os.Getenv("SPACES_BUCKET_NAME")
	if spacesBucketName == "" {
		return nil, fmt.Errorf("SPACES_BUCKET_NAME environment variable is required")
	}

	spacesCDNUrl := os.Getenv("SPACES_CDN_URL")
	if spacesCDNUrl == "" {
		return nil, fmt.Errorf("SPACES_CDN_URL environment variable is required")
	}

	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	if jwtSecretKey == "" {
		return nil, fmt.Errorf("JWT_SECRET_KEY environment variable is required")
	}

	cfg := &Config{
		Port: port,
		App: AppConfig{
			Environment: os.Getenv("ENVIRONMENT"),
			LogLevel:    os.Getenv("LOG_LEVEL"),
		},
		Database: DatabaseConfig{
			Host:          dbHost,
			Port:          dbPort,
			User:          dbUser,
			Password:      dbPassword,
			Name:          dbName,
			SSLMode:       sslMode,
			RunMigrations: runMigrations,
			MigrationsDir: migrationsDir,
		},
		OAuth: OAuthConfig{
			Google: OAuthProviderConfig{
				ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
				ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
				RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
			},
			Apple: OAuthProviderConfig{
				ClientID:     os.Getenv("APPLE_CLIENT_ID"),
				ClientSecret: os.Getenv("APPLE_CLIENT_SECRET"),
				RedirectURL:  os.Getenv("APPLE_REDIRECT_URL"),
			},
		},
		Storage: StorageConfig{
			SpacesRegion:     spacesRegion,
			SpacesEndpoint:   spacesEndpoint,
			SpacesAccessKey:  spacesAccessKey,
			SpacesSecretKey:  spacesSecretKey,
			SpacesBucketName: spacesBucketName,
			SpacesCDNUrl:     spacesCDNUrl,
		},
		Auth: AuthConfig{
			JWTSecretKey: jwtSecretKey,
		},
	}

	return cfg, nil
}

func InitDB(cfg DatabaseConfig) {
	log := logger.Get()
	var err error

	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode,
	)

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database: %v\n", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Error connecting to the database: %v\n", err)
	}
}

func InitOAuth(cfg OAuthConfig) {
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
}

func InitS3(cfg StorageConfig) {
	log := logger.Get()

	sess, err := session.NewSession(&aws.Config{
		Region:           aws.String(cfg.SpacesRegion),
		Endpoint:         aws.String(cfg.SpacesEndpoint),
		Credentials:      credentials.NewStaticCredentials(cfg.SpacesAccessKey, cfg.SpacesSecretKey, ""),
		S3ForcePathStyle: aws.Bool(true),
	})
	if err != nil {
		log.Fatalf("unable to create AWS session: %v", err)
	}

	s3Session = s3.New(sess)
	s3BucketName = cfg.SpacesBucketName

	corsRule := &s3.CORSConfiguration{
		CORSRules: []*s3.CORSRule{
			{
				AllowedHeaders: []*string{aws.String("*")},
				AllowedMethods: []*string{
					aws.String("GET"),
					aws.String("PUT"),
					aws.String("POST"),
					aws.String("DELETE"),
					aws.String("HEAD"),
				},
				AllowedOrigins: []*string{aws.String("http://localhost:5173"), aws.String("http://localhost:3000")},
				MaxAgeSeconds:  aws.Int64(3000),
			},
		},
	}

	_, err = s3Session.PutBucketCors(&s3.PutBucketCorsInput{
		Bucket:            aws.String(s3BucketName),
		CORSConfiguration: corsRule,
	})
	if err != nil {
		log.Errorf("Failed to set bucket CORS: %v", err)
	}
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

func GetS3Session() *s3.S3 {
	return s3Session
}

func GetS3BucketName() string {
	return s3BucketName
}
