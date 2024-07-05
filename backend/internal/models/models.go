// internal/models/models.go
package models

import "time"

// User specific models

type User struct {
	ID                int       `json:"user_id"`
	Username          string    `json:"username"`
	Email             string    `json:"email"`
	Role              string    `json:"role"`
	PasswordHash      string    `json:"-"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	FirstName         string    `json:"first_name,omitempty"`
	LastName          string    `json:"last_name,omitempty"`
	ProfilePictureURL string    `json:"profile_picture_url,omitempty"`
	LastLoginAt       time.Time `json:"last_login_at,omitempty"`
	IsActive          bool      `json:"is_active"`
	IsEmailVerified   bool      `json:"is_email_verified"`
	Bio               string    `json:"bio,omitempty"`
	Location          string    `json:"location,omitempty"`
	CPUs              int       `json:"cpus,omitempty"`
	Preferences       string    `json:"preferences,omitempty"` // JSON for user preferences
}

// Streak specific models

type Streak struct {
	ID            int       `json:"id"`
	UserID        int       `json:"user_id"`
	StartDate     time.Time `json:"start_date"`
	EndDate       time.Time `json:"end_date,omitempty"`
	CurrentStreak int       `json:"current_streak"`
	LongestStreak int       `json:"longest_streak"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Course specific models

type Course struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Unit specific models

type Unit struct {
	ID          int       `json:"id"`
	CourseID    int       `json:"course_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Module specific models

type Module struct {
	ID          int       `json:"id"`
	UnitID      int       `json:"unit_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Content     string    `json:"content"` // JSON content
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Module question specific models

type ModuleQuestion struct {
	ID        int       `json:"id"`
	ModuleID  int       `json:"module_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Module question answer specific models

type ModuleQuestionAnswer struct {
	ID         int       `json:"id"`
	QuestionID int       `json:"question_id"`
	Content    string    `json:"content"`
	IsCorrect  bool      `json:"is_correct"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// User module session specific models

type UserModuleSession struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	ModuleID        int       `json:"module_id"`
	StartedAt       time.Time `json:"started_at"`
	CompletedAt     time.Time `json:"completed_at,omitempty"`
	Progress        float64   `json:"progress"`
	CurrentPosition int       `json:"current_position"`
	LastAccessed    time.Time `json:"last_accessed"`
}

// User answer specific models

type UserAnswer struct {
	ID                  int       `json:"id"`
	UserModuleSessionID int       `json:"user_module_session_id"`
	QuestionID          int       `json:"question_id"`
	AnswerID            int       `json:"answer_id"`
	AnsweredAt          time.Time `json:"answered_at"`
	IsCorrect           bool      `json:"is_correct"`
}

// Achievement specific models

type Achievement struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Points      int       `json:"points"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// User achievement specific models

type UserAchievement struct {
	ID            int       `json:"id"`
	UserID        int       `json:"user_id"`
	AchievementID int       `json:"achievement_id"`
	AchievedAt    time.Time `json:"achieved_at"`
}

// Notification specific models

type Notification struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Content   string    `json:"content"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}
