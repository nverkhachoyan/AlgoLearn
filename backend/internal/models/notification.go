package models

import "time"

type Notification struct {
	ID        int32     `json:"id"`
	UserID    int64     `json:"userId"`
	Content   string    `json:"content"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"createdAt"`
}
