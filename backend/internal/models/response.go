package models

import (
	"algolearn/internal/errors"
)

type Response struct {
	Success   bool             `json:"success"`
	Message   string           `json:"message"`
	Data      interface{}      `json:"data,omitempty"`
	Error     string           `json:"error,omitempty"`
	ErrorCode errors.ErrorCode `json:"error_code,omitempty"`
}

type PaginationRequest struct {
	Page     int `query:"page" binding:"min=1"`
	PageSize int `query:"page_size" binding:"min=1,max=100"`
}

type PaginatedResponse struct {
	Items      interface{} `json:"items"`
	Total      int64       `json:"total"`
	PageSize   int         `json:"page_size"`
	Page       int         `json:"page"`
	TotalPages int         `json:"total_pages"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegistrationRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
