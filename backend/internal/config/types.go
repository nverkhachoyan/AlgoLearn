package config

// AppConfig holds application-level settings
type AppConfig struct {
	Environment string
	LogLevel    string
}

// DatabaseConfig holds database connection settings
type DatabaseConfig struct {
	Host          string
	Port          int
	User          string
	Password      string
	Name          string
	SSLMode       string
	RunMigrations string
	MigrationsDir string
}

// OAuthProviderConfig holds configuration for an OAuth provider
type OAuthProviderConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

// OAuthConfig holds OAuth provider settings
type OAuthConfig struct {
	Google OAuthProviderConfig
	Apple  OAuthProviderConfig
}

// StorageConfig holds cloud storage settings
type StorageConfig struct {
	SpacesRegion     string
	SpacesEndpoint   string
	SpacesAccessKey  string
	SpacesSecretKey  string
	SpacesBucketName string
	SpacesCDNUrl     string
}

// Config holds all application configuration
type Config struct {
	Port     string
	App      AppConfig
	Database DatabaseConfig
	OAuth    OAuthConfig
	Storage  StorageConfig
	Auth     AuthConfig
}

type AuthConfig struct {
	JWTSecretKey string
}
