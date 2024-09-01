package middleware

import (
	"net/http"
	"time"

	"algolearn-backend/internal/config"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		lrw := newLoggingResponseWriter(w)

		next.ServeHTTP(lrw, r)

		config.Log.Debugf("UserAgent: \"%s\", ResponseTime: \"%s\"",
			r.UserAgent(),
			time.Since(start).String(),
		)

		config.Log.Infof("%s - \"%s %s %s\" %d %d",
			r.RemoteAddr,
			r.Method,
			r.RequestURI,
			r.Proto,
			lrw.statusCode,
			lrw.responseSize,
		)

	})
}

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
