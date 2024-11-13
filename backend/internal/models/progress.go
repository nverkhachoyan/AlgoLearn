package models

type Status string

const (
	Uninitiated Status = "uninitiated"
	InProgress  Status = "in_progress"
	Completed   Status = "completed"
	Abandoned   Status = "abandoned"
)

type CourseProgressSummary struct {
	BaseModel
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	BackgroundColor string                 `json:"background_color"`
	IconURL         string                 `json:"icon_url"`
	Duration        int16                  `json:"duration"`
	DifficultyLevel DifficultyLevel        `json:"difficulty_level"`
	Authors         []Author               `json:"authors"`
	Tags            []Tag                  `json:"tags"`
	Rating          float64                `json:"rating"`
	Unit            *UnitProgressSummary   `json:"current_unit"`
	Module          *ModuleProgressSummary `json:"current_module"`
}

type UnitProgressSummary struct {
	BaseModel
	Name        string `json:"name"`
	Description string `json:"description"`
}

type ModuleProgressSummary struct {
	BaseModel
	ModuleUnitID int64  `json:"module_unit_id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
}
