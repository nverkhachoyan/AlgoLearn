package errors

type ErrorCode string

const (
	ACCOUNT_EXISTS ErrorCode = "ACCOUNT_EXISTS"
	INVALID_REQUEST  ErrorCode = "INVALID_REQUEST"
)
