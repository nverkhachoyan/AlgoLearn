package models

import (
	"database/sql"
	"encoding/json"
)

type DifficultyLevel string

var (
	Beginner     DifficultyLevel = "beginner"
	Intermediate DifficultyLevel = "intermediate"
	Advanced     DifficultyLevel = "advanced"
	Expert       DifficultyLevel = "expert"
)

type Course struct {
	BaseModel
	Name            string          `json:"name"`
	Description     string          `json:"description"`
	BackgroundColor sql.NullString  `json:"background_color"`
	IconURL         sql.NullString  `json:"icon_url"`
	Duration        int16           `json:"duration"`
	DifficultyLevel DifficultyLevel `json:"difficulty_level"`
	Authors         []Author        `json:"authors"`
	Tags            []Tag           `json:"tags"`
	Rating          float64         `json:"rating"`
	LearnersCount   int64           `json:"learners_count"`
	Units           []Unit          `json:"units,omitempty"`
}

func (c Course) MarshalJSON() ([]byte, error) {
	data := map[string]interface{}{
		"id":               c.ID,
		"created_at":       c.CreatedAt,
		"updated_at":       c.UpdatedAt,
		"name":             c.Name,
		"description":      c.Description,
		"duration":         c.Duration,
		"difficulty_level": c.DifficultyLevel,
		"authors":          c.Authors,
		"tags":             c.Tags,
		"rating":           c.Rating,
		"learners_count":   c.LearnersCount,
		"units":            c.Units,
	}

	if c.BackgroundColor.Valid {
		data["background_color"] = c.BackgroundColor.String
	} else {
		data["background_color"] = nil
	}

	if c.IconURL.Valid {
		data["icon_url"] = c.IconURL.String
	} else {
		data["icon_url"] = nil
	}

	return json.Marshal(data)
}

func (c *Course) UnmarshalJSON(data []byte) error {
	type Alias Course
	temp := &struct {
		BackgroundColor *string `json:"background_color"`
		IconURL         *string `json:"icon_url"`
		*Alias
	}{
		Alias: (*Alias)(c),
	}

	if err := json.Unmarshal(data, &temp); err != nil {
		return err
	}

	if temp.BackgroundColor != nil {
		c.BackgroundColor.String = *temp.BackgroundColor
		c.BackgroundColor.Valid = true
	} else {
		c.BackgroundColor.String = ""
		c.BackgroundColor.Valid = false
	}

	if temp.IconURL != nil {
		c.IconURL.String = *temp.IconURL
		c.IconURL.Valid = true
	} else {
		c.IconURL.String = ""
		c.IconURL.Valid = false
	}

	return nil
}
