package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                int32             `json:"id,omitempty"`
	CreatedAt         time.Time         `json:"createdAt"`
	UpdatedAt         time.Time         `json:"updatedAt"`
	Username          string            `json:"username"`
	Email             string            `json:"email"`
	OAuthID           string            `json:"oauthId"`
	Role              string            `json:"role"`
	PasswordHash      string            `json:"-"`
	FirstName         string            `json:"firstName"`
	LastName          string            `json:"lastName"`
	ProfilePictureURL string            `json:"profilePictureUrl"`
	LastLoginAt       time.Time         `json:"lastLoginAt"`
	IsActive          bool              `json:"isActive"`
	IsEmailVerified   bool              `json:"isEmailVerified"`
	Bio               string            `json:"bio"`
	Location          string            `json:"location"`
	CPUs              int               `json:"cpus"`
	Preferences       Preferences       `json:"preferences"`
	Streak            int32             `json:"streak"`
	LastStreakDate    time.Time         `json:"lastStreakDate"`
	Achievements      []UserAchievement `json:"achievements"`
	FolderObjectKey   uuid.NullUUID     `json:"folderObjectKey"`
	ImgKey            uuid.NullUUID     `json:"imgKey"`
}

type Preferences struct {
	Theme    string `json:"theme,omitempty"`
	Language string `json:"lang,omitempty"`
	Timezone string `json:"timezone,omitempty"`
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

type UserFilters struct {
	Username        string     `json:"username"`
	Email           string     `json:"email"`
	Role            string     `json:"role"`
	FirstName       string     `json:"first_name"`
	LastName        string     `json:"last_name"`
	Location        string     `json:"location"`
	Bio             string     `json:"bio"`
	MinCPUs         *int       `json:"min_cpus"`
	MaxCPUs         *int       `json:"max_cpus"`
	IsActive        *bool      `json:"is_active"`
	IsEmailVerified *bool      `json:"is_email_verified"`
	CreatedAfter    *time.Time `json:"created_after"`
	CreatedBefore   *time.Time `json:"created_before"`
	UpdatedAfter    *time.Time `json:"updated_after"`
	UpdatedBefore   *time.Time `json:"updated_before"`
	LastLoginAfter  *time.Time `json:"last_login_after"`
	LastLoginBefore *time.Time `json:"last_login_before"`
}

type UserQuery struct {
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
	Filters  UserFilters `json:"filters"`
	Sort     string      `json:"sort"`
	Order    string      `json:"order"`
}
