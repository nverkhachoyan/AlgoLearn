package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	App        AppConfig
	Database   DatabaseConfig
	Auth       AuthConfig
	Storage    StorageConfig
	Monitoring MonitoringConfig
}

type AppConfig struct {
	Environment string
	LogLevel    string
	Port        int
}

type DatabaseConfig struct {
	Host           string
	Port           int
	User           string
	Password       string
	Name           string
	URL            string
	RunMigrations  bool
	DownMigrations bool
	DataDevice     string
	DataPath       string
}

type AuthConfig struct {
	JWTSecretKey string
	OAuth        OAuthConfig
}

type OAuthConfig struct {
	Google GoogleOAuthConfig
	Apple  AppleOAuthConfig
}

type GoogleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type AppleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type StorageConfig struct {
	SpacesAccessKey string
	SpacesSecretKey string
	SpacesRegion    string
	SpacesEndpoint  string
	BucketName      string
}

type MonitoringConfig struct {
	GrafanaCloudPromURL    string
	GrafanaCloudPromUser   string
	GrafanaCloudPromAPIKey string
}

// LoadConfig loads environment variables and returns a config struct
func LoadConfig() (*Config, error) {
	// Load environment files
	if err := loadEnvFile(); err != nil {
		return nil, fmt.Errorf("failed to load env file: %w", err)
	}

	cfg := &Config{}

	// App Config
	cfg.App = AppConfig{
		Environment: "development",
		LogLevel:    getEnvOrDefault("LOG_LEVEL", "INFO"),
		Port:        getEnvAsIntOrDefault("PORT", 8080),
	}

	// Database Config
	cfg.Database = DatabaseConfig{
		Host:           getEnvOrDefault("DB_HOST", "localhost"),
		Port:           getEnvAsIntOrDefault("DB_PORT", 5432),
		User:           requireEnv("DB_USER"),
		Password:       requireEnv("DB_PASSWORD"),
		Name:           requireEnv("DB_NAME"),
		URL:            requireEnv("DATABASE_URL"),
		RunMigrations:  getEnvAsBoolOrDefault("RUN_MIGRATIONS", false),
		DownMigrations: getEnvAsBoolOrDefault("RUN_DOWN_MIGRATIONS", false),
		DataDevice:     getEnvOrDefault("POSTGRES_DATA_DEVICE", "/data"),
		DataPath:       getEnvOrDefault("POSTGRES_DATA_PATH", "postgresql_data"),
	}

	// Auth Config
	cfg.Auth = AuthConfig{
		JWTSecretKey: requireEnv("JWT_SECRET_KEY"),
		OAuth: OAuthConfig{
			Google: GoogleOAuthConfig{
				ClientID:     requireEnv("GOOGLE_CLIENT_ID"),
				ClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
				RedirectURL:  requireEnv("GOOGLE_REDIRECT_URL"),
			},
			Apple: AppleOAuthConfig{
				ClientID:     getEnvOrDefault("APPLE_CLIENT_ID", ""),
				ClientSecret: getEnvOrDefault("APPLE_CLIENT_SECRET", ""),
				RedirectURL:  getEnvOrDefault("APPLE_REDIRECT_URL", ""),
			},
		},
	}

	// Storage Config
	cfg.Storage = StorageConfig{
		SpacesAccessKey: requireEnv("SPACES_ACCESS_KEY"),
		SpacesSecretKey: requireEnv("SPACES_SECRET_KEY"),
		SpacesRegion:    requireEnv("SPACES_REGION"),
		SpacesEndpoint:  requireEnv("SPACES_ENDPOINT"),
		BucketName:      requireEnv("BUCKET_NAME"),
	}

	// Monitoring Config
	cfg.Monitoring = MonitoringConfig{
		GrafanaCloudPromURL:    requireEnv("GRAFANA_CLOUD_PROM_URL"),
		GrafanaCloudPromUser:   requireEnv("GRAFANA_CLOUD_PROM_API_USER"),
		GrafanaCloudPromAPIKey: requireEnv("GRAFANA_CLOUD_PROM_API_KEY"),
	}

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return cfg, nil
}

// loadEnvFile loads the appropriate .env file based on environment
func loadEnvFile() error {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}

	// List of files to try, in order of precedence
	files := []string{
		fmt.Sprintf(".env.%s.local", env), // .env.development.local
		fmt.Sprintf(".env.%s", env),       // .env.development
		".env.local",                      // .env.local
		".env",                            // .env
	}

	var loaded bool
	var loadErrors []error

	for _, file := range files {
		if err := godotenv.Load(file); err == nil {
			loaded = true
			break
		} else {
			loadErrors = append(loadErrors, fmt.Errorf("failed to load %s: %w", file, err))
		}
	}

	// In development, we want to ensure we have some env file
	if !loaded && env == "development" {
		return fmt.Errorf("no .env file found. Attempted files: %v", loadErrors)
	}

	return nil
}

// MustLoadConfig loads config and panics if there's an error
func MustLoadConfig() *Config {
	cfg, err := LoadConfig()
	if err != nil {
		panic(fmt.Sprintf("failed to load config: %v", err))
	}
	return cfg
}

// Validate checks if the configuration is valid
func (c *Config) Validate() error {
	if c.App.Environment != "development" && c.App.Environment != "production" {
		return fmt.Errorf("invalid environment: %s", c.App.Environment)
	}

	if c.App.Port <= 0 {
		return fmt.Errorf("invalid port number: %d", c.App.Port)
	}

	if c.Database.URL == "" {
		return fmt.Errorf("database URL is required")
	}

	// Add more validation as needed for your specific requirements
	return nil
}

// LoadTestConfig loads configuration for testing
func LoadTestConfig() (*Config, error) {
	if err := godotenv.Load(".env.test"); err != nil {
		return nil, fmt.Errorf("error loading test env file: %w", err)
	}
	return LoadConfig()
}

func requireEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic(fmt.Sprintf("Required environment variable %s is not set", key))
	}
	return value
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsIntOrDefault(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsBoolOrDefault(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func (c *Config) IsDevelopment() bool {
	return c.App.Environment == "development"
}

func (c *Config) IsProduction() bool {
	return c.App.Environment == "production"
}

func (c *Config) HasGoogleOAuth() bool {
	return c.Auth.OAuth.Google.ClientID != "" && c.Auth.OAuth.Google.ClientSecret != ""
}

func (c *Config) HasAppleOAuth() bool {
	return c.Auth.OAuth.Apple.ClientID != "" && c.Auth.OAuth.Apple.ClientSecret != ""
}

// GetAddress returns the formatted address string for the server
func (c *AppConfig) GetAddress() string {
	return fmt.Sprintf(":%d", c.Port)
}
