package models

import (
	"time"
)

type User struct {
	BaseModel
	Username          string            `json:"username"`
	Email             string            `json:"email"`
	OAuthID           string            `json:"oauth_id,omitempty"`
	Role              string            `json:"role"`
	PasswordHash      string            `json:"-"`
	FirstName         string            `json:"first_name,omitempty"`
	LastName          string            `json:"last_name,omitempty"`
	ProfilePictureURL string            `json:"profile_picture_url,omitempty"`
	LastLoginAt       time.Time         `json:"last_login_at,omitempty"`
	IsActive          bool              `json:"is_active"`
	IsEmailVerified   bool              `json:"is_email_verified"`
	Bio               string            `json:"bio,omitempty"`
	Location          string            `json:"location,omitempty"`
	CPUs              int               `json:"cpus"`
	Preferences       string            `json:"preferences,omitempty"`  // JSON for user preferences
	Streaks           []Streak          `json:"streaks,omitempty"`      // Add streaks
	Achievements      []UserAchievement `json:"achievements,omitempty"` // Add achievements
}

// User Progress and Answers

type ModuleProgressStatus string

const (
	InProgress ModuleProgressStatus = "in_progress"
	Completed  ModuleProgressStatus = "completed"
	Abandoned  ModuleProgressStatus = "abandoned"
)

// Tracking user progress for each module
type UserModuleProgress struct {
	BaseModel
	UserID          int                  `json:"user_id"`
	ModuleID        int                  `json:"module_id"`
	StartedAt       time.Time            `json:"started_at"`
	CompletedAt     time.Time            `json:"completed_at,omitempty"`
	Progress        float64              `json:"progress"`
	CurrentPosition int                  `json:"current_position"`
	LastAccessed    time.Time            `json:"last_accessed"`
	Answers         []UserQuestionAnswer `json:"answers"`
	Status          ModuleProgressStatus `json:"status"`
}

// User answers for questions in each module
type UserQuestionAnswer struct {
	BaseModel
	UserModuleProgressID int       `json:"user_module_session_id"`
	QuestionID           int       `json:"question_id"`
	AnswerID             int       `json:"answer_id"`
	AnsweredAt           time.Time `json:"answered_at"`
	IsCorrect            bool      `json:"is_correct"`
}

type UserCourse struct {
	BaseModel
	UserID                 int `json:"user_id"`
	CourseID               int `json:"course_id"`
	LatestModuleProgressID int `json:"latest_module_session_id"`
}
