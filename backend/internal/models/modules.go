package models

type ModuleQueryParams struct {
	Type string 
	Filter string
}

// func (p ModuleQueryParams) Validate() error {
// 	switch p.Type {
// 	case "full", "summary":
// 		// valid types
// 	case "":
// 		return errors.New("type parameter is required (supported: 'full', 'summary')")
// 	default:
// 		return errors.New("invalid type parameter (supported: 'full', 'summary')")
// 	}

// 	if p.Type == "summary" && p.Filter != "" {
// 		return errors.New("include parameter not supported for summary type")
// 	}

// 	if p.Type == "full" && p.Filter != "" && p.Filter != "progress" {
// 		return errors.New("invalid include parameter (supported: 'progress')")
// 	}

// 	return nil
// }