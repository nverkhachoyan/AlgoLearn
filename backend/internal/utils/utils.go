package utils

import (
	"database/sql/driver"
	"fmt"

	"database/sql"

	"github.com/LukaGiorgadze/gonull"
	"github.com/lib/pq"
)

// NullableStringSlice handles scanning and valuing of []gonull.Nullable[string]
type NullableStringSlice []gonull.Nullable[string]

// Scan implements the sql.Scanner interface.
func (n *NullableStringSlice) Scan(src interface{}) error {
	if src == nil {
		*n = nil
		return nil
	}

	var temp []sql.NullString
	err := pq.Array(&temp).Scan(src)
	if err != nil {
		return fmt.Errorf("NullableStringSlice Scan error: %w", err)
	}

	*n = make([]gonull.Nullable[string], len(temp))
	for i, ns := range temp {
		if ns.Valid {
			(*n)[i] = gonull.NewNullable(ns.String)
		} else {
			(*n)[i] = gonull.Nullable[string]{Valid: false, Present: true}
		}
	}

	return nil
}

// Value implements the driver.Valuer interface.
func (n NullableStringSlice) Value() (driver.Value, error) {
	if n == nil {
		return nil, nil
	}

	var temp []interface{}
	for _, ns := range n {
		if ns.Valid {
			temp = append(temp, ns.Val)
		} else {
			temp = append(temp, nil)
		}
	}

	return pq.Array(temp).Value()
}
