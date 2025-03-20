package models

import "github.com/google/uuid"

type DifficultyLevel string
type Status string

var (
	Beginner     DifficultyLevel = "beginner"
	Intermediate DifficultyLevel = "intermediate"
	Advanced     DifficultyLevel = "advanced"
	Expert       DifficultyLevel = "expert"
)

const (
	Uninitiated Status = "uninitiated"
	InProgress  Status = "in_progress"
	Completed   Status = "completed"
	Abandoned   Status = "abandoned"
)

type Course struct {
	BaseModel
	FolderObjectKey uuid.NullUUID   `json:"folderObjectKey"`
	Draft           bool            `json:"draft"`
	Name            string          `json:"name"`
	Description     string          `json:"description"`
	Requirements    string          `json:"requirements"`
	WhatYouLearn    string          `json:"whatYouLearn"`
	BackgroundColor string          `json:"backgroundColor"`
	ImgKey          uuid.NullUUID   `json:"imgKey"`
	MediaExt        string          `json:"mediaExt"`
	Duration        int16           `json:"duration"`
	DifficultyLevel DifficultyLevel `json:"difficultyLevel"`
	Authors         []Author        `json:"authors"`
	Tags            []Tag           `json:"tags"`
	Rating          float64         `json:"rating"`
	CurrentUnit     *Unit           `json:"currentUnit"`
	CurrentModule   *Module         `json:"currentModule"`
	Progress        float64         `json:"progress"`
	Units           []*Unit         `json:"units"`
}

type Unit struct {
	BaseModel
	FolderObjectKey uuid.NullUUID `json:"folderObjectKey"`
	ImgKey          uuid.NullUUID `json:"imgKey"`
	MediaExt        string        `json:"mediaExt"`
	UnitNumber      int16         `json:"unitNumber"`
	Name            string        `json:"name"`
	Description     string        `json:"description"`
	Modules         []Module      `json:"modules"`
}

type CourseQuery struct {
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
	Filters  interface{} `json:"filters"`
	Sort     string      `json:"sort"`
	Order    string      `json:"order"`
}
