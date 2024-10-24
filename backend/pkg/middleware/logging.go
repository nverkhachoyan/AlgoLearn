package middleware

import (
	"algolearn/pkg/logger"
	"net/http"
	"time"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.Get()
		start := time.Now()

		rw := &responseWriter{w, http.StatusOK}

		log.WithFields(logger.HTTPRequestFields(r)).Info("Incoming request")

		next.ServeHTTP(rw, r)

		duration := time.Since(start)
		log.WithFields(logger.Fields{
			"method":      r.Method,
			"path":        r.URL.Path,
			"status":      rw.status,
			"duration_ms": duration.Milliseconds(),
		}).Info("Request completed")
	})
}

type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(status int) {
	rw.status = status
	rw.ResponseWriter.WriteHeader(status)
}
