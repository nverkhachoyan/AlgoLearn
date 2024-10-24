package logger

import (
	"net/http"
	"time"
)

// HTTPRequestFields returns standard fields for HTTP request logging
func HTTPRequestFields(r *http.Request) Fields {
	return Fields{
		"method":     r.Method,
		"path":       r.URL.Path,
		"query":      r.URL.RawQuery,
		"remote_ip":  r.RemoteAddr,
		"user_agent": r.UserAgent(),
	}
}

// APIResponseFields returns standard fields for API response logging
func APIResponseFields(statusCode int, duration time.Duration) Fields {
	return Fields{
		"status_code": statusCode,
		"duration_ms": duration.Milliseconds(),
	}
}

// ErrorFields returns standard fields for error logging
func ErrorFields(err error) Fields {
	return Fields{
		"error": err.Error(),
	}
}