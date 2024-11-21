package models

import "time"

type BaseModel struct {
	ID        int64     `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type QueryParams struct {
	Type string 
	Include string
}