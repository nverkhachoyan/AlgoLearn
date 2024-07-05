// internal/repository/modules.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllModulesByUnitID(unitID int) ([]models.Module, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, unit_id, name, description, content, created_at, updated_at FROM modules WHERE unit_id = $1", unitID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var modules []models.Module
	for rows.Next() {
		var module models.Module
		err := rows.Scan(&module.ID, &module.UnitID, &module.Name, &module.Description, &module.Content, &module.CreatedAt, &module.UpdatedAt)
		if err != nil {
			return nil, err
		}
		modules = append(modules, module)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return modules, nil
}

func GetModuleByID(id int) (*models.Module, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, unit_id, name, description, content, created_at, updated_at FROM modules WHERE id = $1", id)

	var module models.Module
	err := row.Scan(&module.ID, &module.UnitID, &module.Name, &module.Description, &module.Content, &module.CreatedAt, &module.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &module, nil
}

func GetModulesByUnitID(unitID int) ([]models.Module, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, unit_id, name, description, content, created_at, updated_at FROM modules WHERE unit_id = $1", unitID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var modules []models.Module
	for rows.Next() {
		var module models.Module
		err := rows.Scan(&module.ID, &module.UnitID, &module.Name, &module.Description, &module.Content, &module.CreatedAt, &module.UpdatedAt)
		if err != nil {
			return nil, err
		}
		modules = append(modules, module)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return modules, nil
}

func CreateModule(module *models.Module) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO modules (unit_id, name, description, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at",
		module.UnitID, module.Name, module.Description, module.Content,
	).Scan(&module.ID, &module.CreatedAt, &module.UpdatedAt)
	return err
}

func UpdateModule(module *models.Module) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE modules SET name = $1, description = $2, content = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
		module.Name, module.Description, module.Content, module.ID,
	)
	return err
}

func DeleteModule(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM modules WHERE id = $1", id)
	return err
}
