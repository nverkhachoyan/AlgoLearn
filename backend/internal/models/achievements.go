package models

import "time"

type Streak struct {
	ID            int       `json:"id"`
	UserID        int       `json:"userId"`
	StartDate     time.Time `json:"startDate"`
	EndDate       time.Time `json:"endDate,omitempty"`
	CurrentStreak int       `json:"currentStreak"`
	LongestStreak int       `json:"longestStreak"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Achievement struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Points      int       `json:"points"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type UserAchievement struct {
	ID            int       `json:"id"`
	UserID        int       `json:"userId"`
	AchievementID int       `json:"achievementId"`
	AchievedAt    time.Time `json:"achievedAt"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Points        int       `json:"points"`
}
