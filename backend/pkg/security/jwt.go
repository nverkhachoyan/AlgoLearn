package security

import (
	"algolearn/internal/config"
	"algolearn/pkg/logger"
	"time"

	"github.com/golang-jwt/jwt"
)

// GetJWTKey returns the JWT secret key from config
func GetJWTKey() []byte {
	cfg, err := config.LoadConfig()
	if err != nil {
		return nil
	}
	return []byte(cfg.Auth.JWTSecretKey)
}

type Claims struct {
	UserID int32 `json:"user_id"`
	jwt.StandardClaims
}

func GenerateJWT(userID int32) (string, error) {
	log := logger.Get()

	jwtKey := GetJWTKey()
	if len(jwtKey) == 0 {
		log.Error("JWT configuration error")
		return "", jwt.ErrSignatureInvalid
	}

	expirationTime := time.Now().Add(240 * time.Hour)
	claims := &Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		log.Error("Error generating token")
		return "", err
	}

	return tokenString, nil
}

func ValidateJWT(tokenString string) (*Claims, error) {
	log := logger.Get()

	jwtKey := GetJWTKey()
	if len(jwtKey) == 0 {
		log.Error("JWT configuration error")
		return nil, jwt.ErrSignatureInvalid
	}

	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil {
		log.Error("Token validation failed")
		return nil, err
	}

	if !token.Valid {
		log.Error("Invalid token")
		return nil, err
	}

	return claims, nil
}
