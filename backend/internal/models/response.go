package models

import (
	httperr "algolearn/internal/errors"
)

// TODO: change variable names to match json names
type Response struct {
	Success   bool              `json:"success"`
	Message   string            `json:"message"`
	Payload   interface{}       `json:"payload,omitempty"`
	Error     string            `json:"error,omitempty"`
	ErrorCode httperr.ErrorCode `json:"errorCode,omitempty"`
}

type PaginationRequest struct {
	Page     int `query:"page" binding:"min=1"`
	PageSize int `query:"pageSize" binding:"min=1,max=100"`
}

type Pagination struct {
	TotalItems  int64 `json:"totalItems"`
	PageSize    int   `json:"pageSize"`
	CurrentPage int   `json:"currentPage"`
	TotalPages  int   `json:"totalPages"`
}
type PaginatedPayload struct {
	Items      interface{} `json:"items"`
	Pagination `json:"pagination"`
}

type ModuleWithProgressResponse struct {
	Module        Module `json:"module"`
	HasNextModule bool   `json:"hasNextModule"`
	NextModuleID  int32  `json:"nextModuleId"`
}

type StartCourseResponse struct {
	UnitID   int32 `json:"unitId"`
	ModuleID int32 `json:"moduleId"`
}
