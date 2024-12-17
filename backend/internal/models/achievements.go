package models

import "time"

type Streak struct {
	ID            int32     `json:"id"`
	UserID        int64     `json:"userId"`
	StartDate     time.Time `json:"startDate"`
	EndDate       time.Time `json:"endDate,omitempty"`
	CurrentStreak int       `json:"currentStreak"`
	LongestStreak int       `json:"longestStreak"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Achievement struct {
	ID          int32     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Points      int32     `json:"points"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type UserAchievement struct {
	ID            int32     `json:"id"`
	UserID        int64     `json:"userId"`
	AchievementID int32     `json:"achievementId"`
	AchievedAt    time.Time `json:"achievedAt"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Points        int32     `json:"points"`
}
