package httperr

import "errors"

type ErrorCode string

const (
	AccountExists        ErrorCode = "ACCOUNT_EXISTS"
	InvalidRequest       ErrorCode = "INVALID_REQUEST"
	ExceededMaxFileSize  ErrorCode = "EXCEEDED_MAX_FILE_SIZE"
	InvalidJson          ErrorCode = "INVALID_JSON"
	InvalidFormData      ErrorCode = "INVALID_FORM_DATA"
	FileUploadFailed     ErrorCode = "FILE_UPLOAD_FAILED"
	DatabaseFail         ErrorCode = "DATABASE_FAIL"
	Unauthorized         ErrorCode = "UNAUTHORIZED"
	NoData               ErrorCode = "NO_DATA"
	InternalError        ErrorCode = "INTERNAL_ERROR"
	InvalidCredentials   ErrorCode = "INVALID_CREDENTIALS"
	InvalidInput         ErrorCode = "INVALID_INPUT"
	MissingFields        ErrorCode = "MISSING_FIELDS"
	InvalidToken         ErrorCode = "INVALID_TOKEN"
	InvalidCourseID      ErrorCode = "INVALID_COURSE_ID"
	NotImplemented       ErrorCode = "NOT_IMPLEMENTED"
	Forbidden            ErrorCode = "FORBIDDEN"
	AccountNotFound      ErrorCode = "ACCOUNT_NOT_FOUND"
	ContentAlreadyExists ErrorCode = "CONTENT_ALREADY_EXISTS"
	TokenExpired         ErrorCode = "TOKEN_EXPIRED"
	DuplicateValue       ErrorCode = "DUPLICATE_VALUE"
)

var ErrNotFound = errors.New("item not found")
var ErrInsertFailed = errors.New("insertion of item failed")
