package logger

type LogPackage string

const (
	Main       LogPackage = "main"
	Service    LogPackage = "service"
	Handler    LogPackage = "handler"
	Middleware LogPackage = "middleware"
	Security   LogPackage = "security"
)
