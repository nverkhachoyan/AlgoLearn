package models

import (
	"errors"
)

type ModuleQueryParams struct {
	Type string 
	Include string
}

func (p ModuleQueryParams) Validate() error {
	switch p.Type {
	case "full", "summary":
		// valid types
	case "":
		return errors.New("type parameter is required (supported: 'full', 'summary')")
	default:
		return errors.New("invalid type parameter (supported: 'full', 'summary')")
	}

	if p.Type == "summary" && p.Include != "" {
		return errors.New("include parameter not supported for summary type")
	}

	if p.Type == "full" && p.Include != "" && p.Include != "progress" {
		return errors.New("invalid include parameter (supported: 'progress')")
	}

	return nil
}