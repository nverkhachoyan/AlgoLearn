package models

import (
	"algolearn/internal/errors"
)

//TODO: change variable names to match json names
type Response struct {
	Success   bool             `json:"success"`
	Message   string           `json:"message"`
	Data      interface{}      `json:"payload,omitempty"`
	Error     string           `json:"error,omitempty"`
	ErrorCode errors.ErrorCode `json:"errorCode,omitempty"`
}

type PaginationRequest struct {
	Page     int `query:"page" binding:"min=1"`
	PageSize int `query:"pageSize" binding:"min=1,max=100"`
}

type Pagination struct { 
	TotalItems      int64       `json:"totalItems"`
	PageSize   int         `json:"pageSize"`
	CurrentPage       int         `json:"currentPage"`
	TotalPages int         `json:"totalPages"`
}
type PaginatedPayload struct {
	Items      interface{} `json:"items"`
	Pagination `json:"pagination"`
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
