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
	Preferences       string    `json:"preferences,omitempty"` // JSON or serialized data for user preferences
}

// Topic specific models

type Topic struct {
	ID          int       `json:"topic_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Subtopic struct {
	ID          int       `json:"id"`
	TopicID     int       `json:"topic_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type PracticeSession struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	SubtopicID  int       `json:"subtopic_id"`
	StartedAt   time.Time `json:"started_at"`
	CompletedAt time.Time `json:"completed_at"`
}

type Question struct {
	ID         int       `json:"id"`
	SubtopicID int       `json:"subtopic_id"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Answer struct {
	ID         int       `json:"id"`
	QuestionID int       `json:"question_id"`
	Content    string    `json:"content"`
	IsCorrect  bool      `json:"is_correct"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type UserAnswer struct {
	ID         int       `json:"id"`
	SessionID  int       `json:"session_id"`
	QuestionID int       `json:"question_id"`
	AnswerID   int       `json:"answer_id"`
	AnsweredAt time.Time `json:"answered_at"`
	IsCorrect  bool      `json:"is_correct"`
}

type Achievement struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Points      int       `json:"points"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type UserAchievement struct {
	ID            int       `json:"id"`
	UserID        int       `json:"user_id"`
	AchievementID int       `json:"achievement_id"`
	AchievedAt    time.Time `json:"achieved_at"`
}

type Notification struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Content   string    `json:"content"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}
