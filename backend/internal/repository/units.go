package repository

import (
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"errors"
)

var ErrUnitNotFound = errors.New("unit not found")

type UnitRepository interface {
	GetAllUnits(ctx context.Context, courseID int64) ([]models.Unit, error)
	GetUnitByID(ctx context.Context, id int64) (*models.Unit, error)
	CreateUnit(ctx context.Context, unit *models.Unit) (*models.Unit, error)
	UpdateUnit(ctx context.Context, unit *models.Unit) (*models.Unit, error)
	DeleteUnit(ctx context.Context, id int64) error
}

type unitRepository struct {
	db *sql.DB
}

func NewUnitRepository(db *sql.DB) UnitRepository {
	return &unitRepository{db: db}
}

func (r *unitRepository) GetAllUnits(_ context.Context, courseID int64) ([]models.Unit, error) {
	log := logger.Get()
	rows, err := r.db.Query("SELECT * FROM units WHERE course_id = $1", courseID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Errorf("failed to close rows in repository func GetAllUnits. %v", err.Error())
		}
	}(rows)

	var units []models.Unit
	for rows.Next() {
		var unit models.Unit
		err := rows.Scan(
			&unit.ID,
			&unit.CreatedAt,
			&unit.UpdatedAt,
			&unit.CourseID,
			&unit.Name,
			&unit.Description,
		)
		if err != nil {
			return nil, err
		}
		units = append(units, unit)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return units, nil
}

func (r *unitRepository) GetUnitByID(_ context.Context, id int64) (*models.Unit, error) {
	row := r.db.QueryRow("SELECT id, created_at, updated_at, course_id, name, description FROM units WHERE id = $1", id)

	var unit models.Unit
	err := row.Scan(
		&unit.ID,
		&unit.CreatedAt,
		&unit.UpdatedAt,
		&unit.CourseID,
		&unit.Name,
		&unit.Description,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrUnitNotFound
	} else if err != nil {
		return nil, err
	}

	return &unit, nil
}

func (r *unitRepository) CreateUnit(ctx context.Context, unit *models.Unit) (*models.Unit, error) {
	var newUnit models.Unit
	err := r.db.QueryRowContext(ctx,
		`INSERT INTO units (course_id, name, description)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			created_at,
			updated_at,
			course_id,
			name,
			description;
		`,
		unit.CourseID, unit.Name, unit.Description,
	).Scan(
		&newUnit.ID,
		&newUnit.CreatedAt,
		&newUnit.UpdatedAt,
		&newUnit.CourseID,
		&newUnit.Name,
		&newUnit.Description,
	)
	if err != nil {
		return nil, err
	}

	return &newUnit, nil
}

func (r *unitRepository) UpdateUnit(ctx context.Context, unit *models.Unit) (*models.Unit, error) {
	var newUnit models.Unit
	row := r.db.QueryRowContext(ctx,
		`UPDATE units
		SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
		RETURNING
			id,
			created_at,
			updated_at,
			course_id,
			name,
			description;
		`,
		unit.Name, unit.Description, unit.ID).Scan(
		&newUnit.ID,
		&newUnit.CreatedAt,
		&newUnit.UpdatedAt,
		&newUnit.CourseID,
		&newUnit.Name,
		&newUnit.Description,
	)

	if errors.Is(row, sql.ErrNoRows) {
		return nil, ErrUnitNotFound
	}

	return &newUnit, nil
}

func (r *unitRepository) DeleteUnit(_ context.Context, id int64) error {
	_, err := r.db.Exec("DELETE FROM units WHERE id = $1", id)
	return err
}
