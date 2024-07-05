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
			"method":       r.Method,
			"request_uri":  r.RequestURI,
			"remote_addr":  r.RemoteAddr,
			"user_agent":   r.UserAgent(),
			"response_time": time.Since(start).String(),
		}).Info("Handled request")
	})
}