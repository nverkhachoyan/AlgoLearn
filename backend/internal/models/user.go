package models

import (
	"time"
)

type User struct {
	BaseModel
	Username          string            `json:"username"`
	Email             string            `json:"email"`
	OAuthID           string            `json:"oauthId,omitempty"`
	Role              string            `json:"role"`
	PasswordHash      string            `json:"-"`
	FirstName         string            `json:"firstName,omitempty"`
	LastName          string            `json:"lastName,omitempty"`
	ProfilePictureURL string            `json:"profilePictureUrl,omitempty"`
	LastLoginAt       time.Time         `json:"lastLoginAt,omitempty"`
	IsActive          bool              `json:"isActive"`
	IsEmailVerified   bool              `json:"isEmailVerified"`
	Bio               string            `json:"bio,omitempty"`
	Location          string            `json:"location,omitempty"`
	CPUs              int               `json:"cpus"`
	Preferences       string            `json:"preferences,omitempty"`  // JSON for user preferences
	Streaks           []Streak          `json:"streaks,omitempty"`      // Add streaks
	Achievements      []UserAchievement `json:"achievements,omitempty"` // Add achievements
}

// User Progress and Answers

type ModuleProgressStatus string

// const (
// 	InProgress ModuleProgressStatus = "in_progress"
// 	Completed  ModuleProgressStatus = "completed"
// 	Abandoned  ModuleProgressStatus = "abandoned"
// )

// Tracking user progress for each module
type UserModuleProgress struct {
	ID              int                  `json:"id"`
	CreatedAt       time.Time            `json:"createdAt"`
	UpdatedAt       time.Time            `json:"updatedAt"`
	UserID          int64                `json:"userId"`
	ModuleID        int                  `json:"moduleId"`
	StartedAt       time.Time            `json:"startedAt"`
	CompletedAt     time.Time            `json:"completedAt,omitempty"`
	Progress        float64              `json:"progress"`
	CurrentPosition int                  `json:"currentPosition"`
	LastAccessed    time.Time            `json:"lastAccessed"`
	Answers         []UserQuestionAnswer `json:"answers"`
	Status          ModuleProgressStatus `json:"status"`
}

// User answers for questions in each module
type UserQuestionAnswer struct {
	BaseModel
	UserModuleProgressID int       `json:"userModuleSessionId"`
	QuestionID           int       `json:"questionId"`
	OptionID             int       `json:"optionId"`
	AnsweredAt           time.Time `json:"answeredAt"`
	IsCorrect            bool      `json:"isCorrect"`
}

type UserCourse struct {
	BaseModel
	UserID                 int `json:"userId"`
	CourseID               int `json:"courseId"`
	LatestModuleProgressID int `json:"latestModuleSessionId"`
}
