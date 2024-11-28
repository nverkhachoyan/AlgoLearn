package models

type ModuleQueryParams struct {
	Type   string
	Filter string
}

type ModulePayload struct {
	Module        Module `json:"module"`
	NextModuleID  int64  `json:"nextModuleId"`
	HasNextModule bool   `json:"hasNextModule"`
}
