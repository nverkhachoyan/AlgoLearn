package middleware

import (
	"net/http"
	"time"

	"algolearn-backend/internal/config"

	"github.com/sirupsen/logrus"
)

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode   int
	responseSize int
}

func newLoggingResponseWriter(w http.ResponseWriter) *loggingResponseWriter {
	return &loggingResponseWriter{w, http.StatusOK, 0}
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

func (lrw *loggingResponseWriter) Write(b []byte) (int, error) {
	size, err := lrw.ResponseWriter.Write(b)
	lrw.responseSize += size
	return size, err
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		lrw := newLoggingResponseWriter(w)

		next.ServeHTTP(lrw, r)

		config.Log.WithFields(logrus.Fields{
			"Method":       r.Method,
			"RequestURI":   r.RequestURI,
			"RemoteAddr":   r.RemoteAddr,
			"UserAgent":    r.UserAgent(),
			"StatusCode":   lrw.statusCode,
			"ResponseSize": lrw.responseSize,
			"ResponseTime": time.Since(start).String(),
			"Headers":      r.Header,
		}).Info("------ Request details ------")
	})
}
