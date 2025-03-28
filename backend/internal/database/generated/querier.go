// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package gen

import (
	"context"
	"database/sql"
	"encoding/json"
)

type Querier interface {
	CalculateCourseProgress(ctx context.Context, arg CalculateCourseProgressParams) (interface{}, error)
	CalculateModuleProgress(ctx context.Context, arg CalculateModuleProgressParams) (interface{}, error)
	CreateAchievement(ctx context.Context, arg CreateAchievementParams) (Achievement, error)
	CreateCourse(ctx context.Context, arg CreateCourseParams) (int32, error)
	CreateCourseTag(ctx context.Context, name string) (int32, error)
	CreateModule(ctx context.Context, arg CreateModuleParams) (Module, error)
	CreateUnit(ctx context.Context, arg CreateUnitParams) (int32, error)
	CreateUser(ctx context.Context, arg CreateUserParams) (User, error)
	DeleteAchievement(ctx context.Context, id int32) error
	DeleteCourse(ctx context.Context, courseID int32) error
	DeleteModule(ctx context.Context, moduleID int32) error
	DeleteModuleProgress(ctx context.Context, arg DeleteModuleProgressParams) error
	DeleteSectionProgress(ctx context.Context, arg DeleteSectionProgressParams) error
	DeleteUnit(ctx context.Context, unitID int32) error
	DeleteUser(ctx context.Context, id int32) error
	DeleteUserCourse(ctx context.Context, arg DeleteUserCourseParams) error
	GetAchievementByID(ctx context.Context, id int32) (Achievement, error)
	GetAchievementsCount(ctx context.Context) (int64, error)
	GetAllAchievements(ctx context.Context) ([]Achievement, error)
	GetAllCoursesWithOptionalProgress(ctx context.Context, arg GetAllCoursesWithOptionalProgressParams) ([]GetAllCoursesWithOptionalProgressRow, error)
	GetAllNotifications(ctx context.Context) ([]Notification, error)
	GetCodeSection(ctx context.Context, sectionID int32) (GetCodeSectionRow, error)
	GetCourseAndUnitIDs(ctx context.Context, id int32) (GetCourseAndUnitIDsRow, error)
	GetCourseAuthors(ctx context.Context, courseID int32) ([]GetCourseAuthorsRow, error)
	GetCourseByID(ctx context.Context, courseID int32) (GetCourseByIDRow, error)
	GetCourseProgressSummaryBase(ctx context.Context, arg GetCourseProgressSummaryBaseParams) (GetCourseProgressSummaryBaseRow, error)
	GetCourseTags(ctx context.Context, courseID int32) ([]Tag, error)
	GetCourseUnits(ctx context.Context, courseID int32) ([]GetCourseUnitsRow, error)
	GetCoursesCount(ctx context.Context) (int64, error)
	GetCurrentUnitAndModule(ctx context.Context, arg GetCurrentUnitAndModuleParams) (GetCurrentUnitAndModuleRow, error)
	GetEnrolledCoursesWithProgress(ctx context.Context, arg GetEnrolledCoursesWithProgressParams) ([]GetEnrolledCoursesWithProgressRow, error)
	GetFirstModuleIdInUnit(ctx context.Context, unitID int32) (int32, error)
	GetFirstUnitAndModuleInCourse(ctx context.Context, courseID int32) (GetFirstUnitAndModuleInCourseRow, error)
	GetFurthestModuleID(ctx context.Context, arg GetFurthestModuleIDParams) (sql.NullInt32, error)
	GetImageSection(ctx context.Context, sectionID int32) (GetImageSectionRow, error)
	GetLastModuleNumber(ctx context.Context, unitID int32) (interface{}, error)
	GetMarkdownSection(ctx context.Context, sectionID int32) (GetMarkdownSectionRow, error)
	GetModuleByID(ctx context.Context, id int32) (Module, error)
	GetModuleProgressByUnit(ctx context.Context, arg GetModuleProgressByUnitParams) ([]GetModuleProgressByUnitRow, error)
	GetModuleSectionsWithProgress(ctx context.Context, arg GetModuleSectionsWithProgressParams) ([]GetModuleSectionsWithProgressRow, error)
	GetModuleTotalCountByUnitId(ctx context.Context, unitID int32) (int64, error)
	GetModuleWithProgress(ctx context.Context, arg GetModuleWithProgressParams) (json.RawMessage, error)
	GetModulesByUnitId(ctx context.Context, unitID int32) ([]Module, error)
	GetModulesCount(ctx context.Context) (int64, error)
	GetModulesList(ctx context.Context, arg GetModulesListParams) ([]GetModulesListRow, error)
	GetNextModuleId(ctx context.Context, arg GetNextModuleIdParams) (int32, error)
	GetNextModuleIdInUnitOrNextUnit(ctx context.Context, arg GetNextModuleIdInUnitOrNextUnitParams) (int32, error)
	GetNextModuleNumber(ctx context.Context, arg GetNextModuleNumberParams) (int32, error)
	GetNextUnitId(ctx context.Context, arg GetNextUnitIdParams) (int32, error)
	GetNextUnitModuleId(ctx context.Context, unitID int32) (int32, error)
	GetPrevModuleId(ctx context.Context, arg GetPrevModuleIdParams) (int32, error)
	GetPrevUnitId(ctx context.Context, arg GetPrevUnitIdParams) (int32, error)
	GetPrevUnitModuleId(ctx context.Context, unitID int32) (int32, error)
	//  object_key UUID,
	//     width INTEGER DEFAULT 200,
	//     height INTEGER DEFAULT 200,
	//     media_ext VARCHAR(10),
	//     url TEXT,
	//     headline TEXT NOT NULL,
	//     caption TEXT NOT NULL,
	GetQuestionSection(ctx context.Context, sectionID int32) (GetQuestionSectionRow, error)
	GetReceivedAchievementsCount(ctx context.Context) (int64, error)
	GetSectionContent(ctx context.Context, sectionID int32) (interface{}, error)
	GetSectionProgress(ctx context.Context, arg GetSectionProgressParams) ([]GetSectionProgressRow, error)
	GetSingleModuleSections(ctx context.Context, arg GetSingleModuleSectionsParams) ([]GetSingleModuleSectionsRow, error)
	GetTopUsersByStreak(ctx context.Context, limit int32) ([]GetTopUsersByStreakRow, error)
	GetUnitByID(ctx context.Context, unitID int32) (Unit, error)
	GetUnitModules(ctx context.Context, unitID int32) ([]GetUnitModulesRow, error)
	GetUnitNumber(ctx context.Context, unitID int32) (int32, error)
	GetUnitsByCourseID(ctx context.Context, courseID int32) ([]Unit, error)
	GetUnitsCount(ctx context.Context) (int64, error)
	GetUserByEmail(ctx context.Context, email string) (GetUserByEmailRow, error)
	GetUserByID(ctx context.Context, id int32) (GetUserByIDRow, error)
	GetUsers(ctx context.Context, arg GetUsersParams) ([]GetUsersRow, error)
	GetUsersCount(ctx context.Context) (int64, error)
	GetVideoSection(ctx context.Context, sectionID int32) (GetVideoSectionRow, error)
	InitializeModuleProgress(ctx context.Context, arg InitializeModuleProgressParams) error
	InsertCodeSection(ctx context.Context, arg InsertCodeSectionParams) error
	InsertCourseAuthor(ctx context.Context, arg InsertCourseAuthorParams) error
	InsertCourseTag(ctx context.Context, arg InsertCourseTagParams) error
	InsertImageSection(ctx context.Context, arg InsertImageSectionParams) error
	InsertLottieSection(ctx context.Context, arg InsertLottieSectionParams) error
	InsertMarkdownSection(ctx context.Context, arg InsertMarkdownSectionParams) error
	InsertModule(ctx context.Context, arg InsertModuleParams) (Module, error)
	InsertQuestion(ctx context.Context, arg InsertQuestionParams) (Question, error)
	InsertQuestionOption(ctx context.Context, arg InsertQuestionOptionParams) error
	InsertQuestionSection(ctx context.Context, arg InsertQuestionSectionParams) error
	InsertQuestionTag(ctx context.Context, arg InsertQuestionTagParams) error
	InsertSection(ctx context.Context, arg InsertSectionParams) (Section, error)
	InsertTag(ctx context.Context, name string) (int32, error)
	InsertUserPreferences(ctx context.Context, arg InsertUserPreferencesParams) (UserPreference, error)
	InsertVideoSection(ctx context.Context, arg InsertVideoSectionParams) error
	IsModuleFurtherThan(ctx context.Context, arg IsModuleFurtherThanParams) (bool, error)
	PublishCourse(ctx context.Context, courseID int32) error
	RemoveCourseTag(ctx context.Context, arg RemoveCourseTagParams) error
	ResetUserStreaks(ctx context.Context) error
	SearchCourseTags(ctx context.Context, arg SearchCourseTagsParams) ([]SearchCourseTagsRow, error)
	SearchCourses(ctx context.Context, arg SearchCoursesParams) ([]SearchCoursesRow, error)
	SearchCoursesFullText(ctx context.Context, arg SearchCoursesFullTextParams) ([]SearchCoursesFullTextRow, error)
	StartCourseUserCourses(ctx context.Context, arg StartCourseUserCoursesParams) error
	UpdateAchievement(ctx context.Context, arg UpdateAchievementParams) (Achievement, error)
	UpdateCourse(ctx context.Context, arg UpdateCourseParams) error
	UpdateModule(ctx context.Context, arg UpdateModuleParams) (Module, error)
	UpdateUnit(ctx context.Context, arg UpdateUnitParams) error
	UpdateUnitNumber(ctx context.Context, arg UpdateUnitNumberParams) error
	UpdateUser(ctx context.Context, arg UpdateUserParams) (User, error)
	UpdateUserPreferences(ctx context.Context, arg UpdateUserPreferencesParams) (UserPreference, error)
	UpdateUserStreak(ctx context.Context, arg UpdateUserStreakParams) (User, error)
	UpsertQuestionAnswer(ctx context.Context, arg UpsertQuestionAnswerParams) error
	UpsertSectionProgress(ctx context.Context, arg UpsertSectionProgressParams) error
	UpsertUserCourse(ctx context.Context, arg UpsertUserCourseParams) error
	UpsertUserModuleProgress(ctx context.Context, arg UpsertUserModuleProgressParams) (int32, error)
}

var _ Querier = (*Queries)(nil)
