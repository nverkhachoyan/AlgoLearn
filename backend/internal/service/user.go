package service

import (
	"algolearn/internal/database"
	gen "algolearn/internal/database/generated"
	"algolearn/internal/models"
	"context"
	"database/sql"
	"fmt"
)

type UserService interface {
	CreateUser(user *models.User) (*models.User, error)
	UpdateUser(user *models.User) error
	GetUserByID(id int32) (*models.User, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	CheckEmailExists(ctx context.Context, email string) (bool, error)
	DeleteUser(id int32) error
}

type userService struct {
	db *database.Database
}

func NewUserService(db *sql.DB) UserService {
	return &userService{db: database.New(db)}
}

func (r *userService) CreateUser(user *models.User) (*models.User, error) {
	ctx := context.Background()

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
		return nil, fmt.Errorf("could not create user: %v", err)
	}

	userPreferences, err := r.db.InsertUserPreferences(ctx, gen.InsertUserPreferencesParams{
		UserID:   newUser.ID,
		Theme:    "dark",
		Language: "en",
		Timezone: "UTC",
	})
	if err != nil {
		return nil, fmt.Errorf("could not create user preferences: %v", err)
	}

	return &models.User{
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

func (r *userService) GetUserByID(id int32) (*models.User, error) {
	ctx := context.Background()
	user, err := r.db.GetUserByID(ctx, id)
	if err != nil {
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
		CPUs:      int(user.Cpus),
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}, nil
}

func (r *userService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	user, err := r.db.GetUserByEmail(ctx, email)
	if err != nil {
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
		CPUs:      int(user.Cpus),
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}, nil
}

func (r *userService) CheckEmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	user, err := r.db.GetUserByEmail(ctx, email)
	if err != nil {
		return false, fmt.Errorf("failed to fetch user: %v", err)
	}

	if user.ID != 0 {
		exists = true
	}

	return exists, nil
}

func (r *userService) UpdateUser(user *models.User) error {
	ctx := context.Background()
	_, err := r.db.UpdateUser(ctx, gen.UpdateUserParams{
		ID:                user.ID,
		Username:          user.Username,
		Email:             user.Email,
		FirstName:         user.FirstName,
		LastName:          user.LastName,
		ProfilePictureUrl: user.ProfilePictureURL,
		Bio:               user.Bio,
		Location:          user.Location,
	})
	if err != nil {
		return fmt.Errorf("could not update user: %v", err)
	}
	return nil
}

func (r *userService) DeleteUser(id int32) error {
	ctx := context.Background()
	err := r.db.DeleteUser(ctx, id)
	if err != nil {
		return fmt.Errorf("could not delete user: %v", err)
	}
	return nil
}

// func (r *userService) ChangeUserPassword(userID int64, newPasswordHash string) error {
// 	query := "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2"
// 	var userParams gen.UpdateUserParams
// 	_, err := r.db.UpdateUser(ctx context.Context, )
// 	if err != nil {
// 		return fmt.Errorf("could not update user password: %v", err)
// 	}
// 	return nil
// }
