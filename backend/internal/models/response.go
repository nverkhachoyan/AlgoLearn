// internal/models/response.go
package models

import (
	"algolearn-backend/internal/errors"
)

// General response model
type Response struct {
	Status    string           `json:"status"`
	Message   string           `json:"message"`
	Data      interface{}      `json:"data,omitempty"`
	Error     string           `json:"error,omitempty"`
	ErrorCode errors.ErrorCode `json:"error_code,omitempty"`
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

type UserResponse struct {
	User User `json:"user"`
}

type CourseResponse struct {
	Course Course `json:"course"`
}

type CourseListResponse struct {
	Courses []Course `json:"courses"`
}

type UnitResponse struct {
	Unit Unit `json:"unit"`
}

type UnitListResponse struct {
	Units []Unit `json:"units"`
}

type ModuleResponse struct {
	Module Module `json:"module"`
}

type ModuleListResponse struct {
	Modules []Module `json:"modules"`
}

type QuestionResponse struct {
	Question ModuleQuestion         `json:"question"`
	Answers  []ModuleQuestionOption `json:"answers"`
}

type ModuleSessionResponse struct {
	SessionID int                `json:"session_id"`
	Module    Module             `json:"module"`
	Progress  float64            `json:"progress"`
	Position  int                `json:"current_position"`
	Questions []QuestionResponse `json:"questions"`
}

type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	TotalCount int         `json:"total_count"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
}
