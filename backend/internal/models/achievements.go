package models

import "time"

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
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Points        int       `json:"points"`
}
