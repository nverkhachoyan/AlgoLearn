package errors

type ErrorCode string

const (
	ACCOUNT_EXISTS         ErrorCode = "ACCOUNT_EXISTS"
	INVALID_REQUEST        ErrorCode = "INVALID_REQUEST"
	EXCEEDED_MAX_FILE_SIZE ErrorCode = "EXCEEDED_MAX_FILE_SIZE"
	INVALID_JSON           ErrorCode = "INVALID_JSON"
	INVALID_FORM_DATA      ErrorCode = "INVALID_FORM_DATA"
	FILE_UPLOAD_FAILED     ErrorCode = "FILE_UPLOAD_FAILED"
	DATABASE_FAIL          ErrorCode = "DATABASE_FAIL"
)
