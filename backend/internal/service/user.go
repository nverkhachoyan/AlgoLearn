package service

import (
	"algolearn/internal/database"
	gen "algolearn/internal/database/generated"
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type UserService interface {
	GetUsers(ctx context.Context, params GetUsersParams) ([]models.User, error)
	GetUsersCount(ctx context.Context) (int64, error)
	GetReceivedAchievementsCount(ctx context.Context) (int64, error)
	CreateUser(ctx context.Context, user *models.User) (*models.User, error)
	UpdateUser(ctx context.Context, user *models.User) error
	GetUserByID(ctx context.Context, id int32) (*models.User, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	CheckEmailExists(ctx context.Context, email string) (bool, error)
	DeleteUser(ctx context.Context, id int32) error
}

type userService struct {
	db  *database.Database
	log *logger.Logger
}

func NewUserService(db *sql.DB) UserService {
	return &userService{db: database.New(db), log: logger.Get()}
}

type GetUsersParams struct {
	Username        string    `json:"username"`
	Email           string    `json:"email"`
	Role            string    `json:"role"`
	FirstName       string    `json:"firstName"`
	LastName        string    `json:"lastName"`
	Location        string    `json:"location"`
	Bio             string    `json:"bio"`
	MinCpus         int32     `json:"minCpus"`
	MaxCpus         int32     `json:"maxCpus"`
	IsActive        *bool     `json:"isActive"`
	IsEmailVerified *bool     `json:"isEmailVerified"`
	CreatedAfter    time.Time `json:"createdAfter"`
	CreatedBefore   time.Time `json:"createdBefore"`
	UpdatedAfter    time.Time `json:"updatedAfter"`
	UpdatedBefore   time.Time `json:"updatedBefore"`
	LastLoginAfter  time.Time `json:"lastLoginAfter"`
	LastLoginBefore time.Time `json:"lastLoginBefore"`
	Sort            string    `json:"sort"`
	Order           string    `json:"order"`
	PageOffset      int32     `json:"pageOffset"`
	PageLimit       int32     `json:"pageLimit"`
}

func (r *userService) GetUsers(ctx context.Context, params GetUsersParams) ([]models.User, error) {
	log := r.log.WithBaseFields(logger.Service, "GetUsers")

	log.Debugf("Getting users with params: %+v", params)

	// First get total count
	totalCount, err := r.db.GetUsersCount(ctx)
	if err != nil {
		log.WithError(err).Error("failed to get total users count")
		return nil, fmt.Errorf("could not fetch total users count: %v", err)
	}
	log.Debugf("Total users count: %d", totalCount)

	// Set default values for pagination if not provided
	if params.PageLimit == 0 {
		params.PageLimit = 10
	}

	// Prepare query params
	queryParams := gen.GetUsersParams{
		Role:            sql.NullString{String: params.Role, Valid: params.Role != ""},
		Username:        sql.NullString{String: params.Username, Valid: params.Username != ""},
		Email:           sql.NullString{String: params.Email, Valid: params.Email != ""},
		FirstName:       sql.NullString{String: params.FirstName, Valid: params.FirstName != ""},
		LastName:        sql.NullString{String: params.LastName, Valid: params.LastName != ""},
		Location:        sql.NullString{String: params.Location, Valid: params.Location != ""},
		Bio:             sql.NullString{String: params.Bio, Valid: params.Bio != ""},
		MinCpus:         sql.NullInt32{Int32: params.MinCpus, Valid: params.MinCpus != 0},
		MaxCpus:         sql.NullInt32{Int32: params.MaxCpus, Valid: params.MaxCpus != 0},
		IsActive:        sql.NullBool{Bool: params.IsActive != nil && *params.IsActive, Valid: params.IsActive != nil},
		IsEmailVerified: sql.NullBool{Bool: params.IsEmailVerified != nil && *params.IsEmailVerified, Valid: params.IsEmailVerified != nil},
		CreatedAfter:    sql.NullTime{Time: params.CreatedAfter, Valid: !params.CreatedAfter.IsZero()},
		CreatedBefore:   sql.NullTime{Time: params.CreatedBefore, Valid: !params.CreatedBefore.IsZero()},
		UpdatedAfter:    sql.NullTime{Time: params.UpdatedAfter, Valid: !params.UpdatedAfter.IsZero()},
		UpdatedBefore:   sql.NullTime{Time: params.UpdatedBefore, Valid: !params.UpdatedBefore.IsZero()},
		LastLoginAfter:  sql.NullTime{Time: params.LastLoginAfter, Valid: !params.LastLoginAfter.IsZero()},
		LastLoginBefore: sql.NullTime{Time: params.LastLoginBefore, Valid: !params.LastLoginBefore.IsZero()},
		SortColumn:      sql.NullString{String: params.Sort, Valid: params.Sort != ""},
		SortDirection:   sql.NullString{String: params.Order, Valid: params.Order != ""},
		PageOffset:      params.PageOffset,
		PageLimit:       params.PageLimit,
	}

	log.Debugf("Query params: %+v", queryParams)

	result, err := r.db.GetUsers(ctx, queryParams)
	if err != nil {
		log.WithError(err).Error("failed to get users")
		return nil, fmt.Errorf("could not fetch users: %v", err)
	}

	log.Debugf("Found %d users", len(result))
	if len(result) > 0 {
		log.Debugf("First user role: %v", result[0].Role)
	}

	users := make([]models.User, 0)
	for _, user := range result {
		users = append(users, models.User{
			ID:                user.ID,
			Username:          user.Username,
			Email:             user.Email,
			Role:              string(user.Role),
			FirstName:         user.FirstName.String,
			LastName:          user.LastName.String,
			ProfilePictureURL: user.ProfilePictureUrl.String,
			Bio:               user.Bio.String,
			Location:          user.Location.String,
			CreatedAt:         user.CreatedAt,
			UpdatedAt:         user.UpdatedAt,
			LastLoginAt:       user.LastLoginAt.Time,
			IsActive:          user.IsActive,
			IsEmailVerified:   user.IsEmailVerified,
			CPUs:              int(user.Cpus),
		})
	}

	return users, nil
}

func (r *userService) GetUsersCount(ctx context.Context) (int64, error) {
	log := r.log.WithBaseFields(logger.Service, "GetUsersCount")

	count, err := r.db.GetUsersCount(ctx)
	if err != nil {
		log.WithError(err).Error("failed to get users count")
		return 0, fmt.Errorf("could not fetch users count: %v", err)
	}
	return count, nil
}

func (r *userService) GetReceivedAchievementsCount(ctx context.Context) (int64, error) {
	log := r.log.WithBaseFields(logger.Service, "GetReceivedAchievementsCount")

	count, err := r.db.GetReceivedAchievementsCount(ctx)
	if err != nil {
		log.WithError(err).Error("failed to get user achievements count")
		return 0, fmt.Errorf("could not fetch user achievements count: %v", err)
	}
	return count, nil
}

func (r *userService) CreateUser(ctx context.Context, user *models.User) (*models.User, error) {
	log := r.log.WithBaseFields(logger.Service, "CreateUser")

	var userParams gen.CreateUserParams
	userParams.Username = user.Username
	userParams.Email = user.Email
	if user.OAuthID != "" {
		userParams.OauthID.String = user.OAuthID
	}
	userParams.Role = gen.UserRole(user.Role)
	userParams.PasswordHash = user.PasswordHash
	if user.FirstName != "" {
		userParams.FirstName.String = user.FirstName
		userParams.FirstName.Valid = true
	}
	if user.LastName != "" {
		userParams.LastName.String = user.LastName
		userParams.LastName.Valid = true
	}
	if user.ProfilePictureURL != "" {
		userParams.ProfilePictureUrl.String = user.ProfilePictureURL
		userParams.ProfilePictureUrl.Valid = true
	}
	if user.Bio != "" {
		userParams.Bio.String = user.Bio
		userParams.Bio.Valid = true
	}
	if user.Location != "" {
		userParams.Location.String = user.Location
		userParams.Location.Valid = true
	}

	newUser, err := r.db.CreateUser(ctx, userParams)
	if err != nil {
		log.WithError(err).Error("failed to create user")
		return nil, fmt.Errorf("could not create user: %v", err)
	}

	userPreferences, err := r.db.InsertUserPreferences(ctx, gen.InsertUserPreferencesParams{
		UserID:   newUser.ID,
		Theme:    "dark",
		Language: "en",
		Timezone: "UTC",
	})
	if err != nil {
		log.WithError(err).Error("failed to create user preferences")
		return nil, fmt.Errorf("could not create user preferences: %v", err)
	}

	return &models.User{
		ID:                newUser.ID,
		Username:          newUser.Username,
		Email:             newUser.Email,
		Role:              string(newUser.Role),
		PasswordHash:      newUser.PasswordHash,
		OAuthID:           newUser.OauthID.String,
		FirstName:         newUser.FirstName.String,
		LastName:          newUser.LastName.String,
		ProfilePictureURL: newUser.ProfilePictureUrl.String,
		Bio:               newUser.Bio.String,
		Location:          newUser.Location.String,
		Preferences: models.Preferences{
			Theme:    userPreferences.Theme,
			Language: userPreferences.Language,
			Timezone: userPreferences.Timezone,
		},
	}, nil
}

func (r *userService) GetUserByID(ctx context.Context, id int32) (*models.User, error) {
	log := r.log.WithBaseFields(logger.Service, "GetUserByID")
	user, err := r.db.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, codes.ErrNotFound
		}
		log.WithError(err).Error("failed to get user by id")
		return nil, fmt.Errorf("could not fetch user: %v", err)
	}
	return &models.User{
		ID:                user.ID,
		Username:          user.Username,
		Email:             user.Email,
		Role:              string(user.Role),
		PasswordHash:      user.PasswordHash,
		FirstName:         user.FirstName.String,
		LastName:          user.LastName.String,
		ProfilePictureURL: user.ProfilePictureUrl.String,
		LastLoginAt:       user.LastLoginAt.Time,
		IsActive:          user.IsActive,
		IsEmailVerified:   user.IsEmailVerified,
		Bio:               user.Bio.String,
		Location:          user.Location.String,
		Preferences: models.Preferences{
			Theme:    user.Theme.String,
			Language: user.Language.String,
			Timezone: user.Timezone.String,
		},
		Streak:          user.Streak,
		CPUs:            int(user.Cpus),
		LastStreakDate:  user.LastStreakDate.Time,
		CreatedAt:       user.CreatedAt,
		UpdatedAt:       user.UpdatedAt,
		FolderObjectKey: uuid.NullUUID{UUID: user.FolderObjectKey.UUID, Valid: user.FolderObjectKey.Valid},
		ImgKey:          uuid.NullUUID{UUID: user.ImgKey.UUID, Valid: user.ImgKey.Valid},
		MediaExt:        user.MediaExt.String,
	}, nil
}

func (r *userService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	log := r.log.WithBaseFields(logger.Service, "GetUserByEmail")

	user, err := r.db.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, codes.ErrNotFound
		}
		log.WithError(err).Error("failed to get user by email")
		return nil, fmt.Errorf("could not fetch user: %v", err)
	}
	return &models.User{
		ID:                user.ID,
		Username:          user.Username,
		Email:             user.Email,
		OAuthID:           user.OauthID.String,
		Role:              string(user.Role),
		PasswordHash:      user.PasswordHash,
		FirstName:         user.FirstName.String,
		LastName:          user.LastName.String,
		ProfilePictureURL: user.ProfilePictureUrl.String,
		LastLoginAt:       user.LastLoginAt.Time,
		IsActive:          user.IsActive,
		IsEmailVerified:   user.IsEmailVerified,
		Bio:               user.Bio.String,
		Location:          user.Location.String,
		Preferences: models.Preferences{
			Theme:    user.Theme.String,
			Language: user.Language.String,
			Timezone: user.Timezone.String,
		},
		CPUs:            int(user.Cpus),
		Streak:          user.Streak,
		LastStreakDate:  user.LastStreakDate.Time,
		CreatedAt:       user.CreatedAt,
		UpdatedAt:       user.UpdatedAt,
		FolderObjectKey: uuid.NullUUID{UUID: user.FolderObjectKey.UUID, Valid: user.FolderObjectKey.Valid},
		ImgKey:          uuid.NullUUID{UUID: user.ImgKey.UUID, Valid: user.ImgKey.Valid},
		MediaExt:        user.MediaExt.String,
	}, nil
}

func (r *userService) CheckEmailExists(ctx context.Context, email string) (bool, error) {
	log := r.log.WithBaseFields(logger.Service, "CheckEmailExists")

	_, err := r.db.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		log.WithError(err).Error("failed to fetch user")
		return false, fmt.Errorf("failed to check email: %v", err)
	}

	return true, nil
}

func (r *userService) UpdateUser(ctx context.Context, user *models.User) error {
	log := r.log.WithBaseFields(logger.Service, "UpdateUser")

	params := gen.UpdateUserParams{
		ID:              user.ID,
		Username:        user.Username,
		Email:           user.Email,
		LastName:        user.LastName,
		FirstName:       user.FirstName,
		Bio:             user.Bio,
		Location:        user.Location,
		FolderObjectKey: uuid.NullUUID{Valid: false},
		ImgKey:          uuid.NullUUID{Valid: false},
		MediaExt:        user.MediaExt,
	}

	if user.FolderObjectKey.Valid {
		params.FolderObjectKey = user.FolderObjectKey
	}

	if user.ImgKey.Valid {
		params.ImgKey = user.ImgKey
	}

	_, err := r.db.UpdateUser(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("user not found")
		}
		log.WithError(err).Error("failed to update user")
		return fmt.Errorf("could not update user: %v", err)
	}
	return nil
}

func (r *userService) DeleteUser(ctx context.Context, id int32) error {
	log := r.log.WithBaseFields(logger.Service, "DeleteUser")

	err := r.db.DeleteUser(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("user not found")
		}
		log.WithError(err).Error("failed to delete user")
		return fmt.Errorf("could not delete user: %v", err)
	}
	return nil
}
