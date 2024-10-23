package models

type Unit struct {
	BaseModel
	CourseID    int64  `json:"course_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}