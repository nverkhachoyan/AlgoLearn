package services

import (
	"log"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

type Claims struct {
	UserID int32 `json:"user_id"`
	jwt.StandardClaims
}

func GenerateJWT(userID int32) (string, error) {
	expirationTime := time.Now().Add(240 * time.Hour)
	claims := &Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func ValidateJWT(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil {
		log.Printf("Error parsing JWT: %v", err)
		return nil, err
	}

	if !token.Valid {
		log.Println("Invalid JWT token")
		return nil, err
	}

	//	log.Printf("Successfully parsed JWT. UserID: %d", claims.UserID)
	return claims, nil
}
