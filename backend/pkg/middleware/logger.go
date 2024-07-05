package middleware

import (
	"net/http"
	"time"

	"algolearn-backend/internal/config"

	"github.com/sirupsen/logrus"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Call the next handler
		next.ServeHTTP(w, r)

		// Log the request details
		config.Log.WithFields(logrus.Fields{
			"Method":       r.Method,
			"RequestURI":   r.RequestURI,
			"RemoteAddr":   r.RemoteAddr,
			"UserAgent":    r.UserAgent(),
			"ResponseTime": time.Since(start).String(),
		}).Info("Request details")
	})
}