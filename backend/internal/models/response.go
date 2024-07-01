// internal/models/response.go
package models

// General response model
type Response struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// User response models
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegistrationRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Topic response models
type TopicResponse struct {
	Topic Topic `json:"topic"`
}

type TopicListResponse struct {
	Topics []Topic `json:"topics"`
}

// Question and Practice Session response models
type QuestionResponse struct {
	Question Question `json:"question"`
	Answers  []Answer `json:"answers"`
}

type PracticeSessionResponse struct {
	SessionID int                `json:"session_id"`
	Questions []QuestionResponse `json:"questions"`
}

// Paginated response model
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	TotalCount int         `json:"total_count"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
}
