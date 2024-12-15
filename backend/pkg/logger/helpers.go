package logger

import (
	"net/http"
)

func HTTPRequestFields(r *http.Request) Fields {
	return Fields{
		"method":     r.Method,
		"path":       r.URL.Path,
		"query":      r.URL.RawQuery,
		"remote_ip":  r.RemoteAddr,
		"user_agent": r.UserAgent(),
	}
}
