package repository

func containsAll(slice []string, elements ...string) bool {
	for _, element := range elements {
		if !contains(slice, element) {
			return false
		}
	}
	return true
}

func contains(slice []string, element string) bool {
	for _, e := range slice {
		if e == element {
			return true
		}
	}
	return false
}
