package service

import "database/sql"

func nullInt32ToInt16(n sql.NullInt32) int16 {
	if n.Valid {
		return int16(n.Int32)
	}
	return 0
}

func nullStringToString(n sql.NullString) string {
	if n.Valid {
		return n.String
	}
	return ""
}
