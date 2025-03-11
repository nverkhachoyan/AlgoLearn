package security

import (
	"algolearn/internal/config"
	"algolearn/pkg/logger"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt"
)

const (
	accessTokenExpiry  = time.Hour * 1      // 1 hour
	refreshTokenExpiry = time.Hour * 24 * 7 // 7 days
)

func GetJWTKey() []byte {
	cfg, err := config.Load()
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
	return generateToken(userID, accessTokenExpiry)
}

func GenerateRefreshToken(userID int32) (string, error) {
	return generateToken(userID, refreshTokenExpiry)
}

func generateToken(userID int32, expiry time.Duration) (string, error) {
	claims := &Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(expiry).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(GetJWTKey()))
}

func ValidateJWT(tokenString string) (*Claims, error) {
	return validateToken(tokenString, accessTokenExpiry)
}

func ValidateRefreshToken(tokenString string) (*Claims, error) {
	return validateToken(tokenString, refreshTokenExpiry)
}

func validateToken(tokenString string, maxExpiry time.Duration) (*Claims, error) {
	log := logger.Get().WithBaseFields(logger.Security, "ValidateJWT")

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(GetJWTKey()), nil
	})

	if err != nil {
		if ve, ok := err.(*jwt.ValidationError); ok {
			if ve.Errors&jwt.ValidationErrorExpired != 0 {
				log.Debug("Token is expired")
				return nil, errors.New("token is expired")
			}
		}
		log.WithError(err).Error("Failed to parse token")
		return nil, err
	}

	if !token.Valid {
		log.Error("Token is invalid")
		return nil, errors.New("invalid token")
	}

	if time.Unix(claims.IssuedAt, 0).Add(maxExpiry).Before(time.Now()) {
		log.Error("Token has exceeded maximum lifetime")
		return nil, errors.New("token has exceeded maximum lifetime")
	}

	return claims, nil
}
