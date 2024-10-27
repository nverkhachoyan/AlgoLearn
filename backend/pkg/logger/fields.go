package logger

type LogPackage string

const (
	Main       LogPackage = "main"
	Repository LogPackage = "repository"
	Handler    LogPackage = "handler"
	Service    LogPackage = "service"
	Middleware LogPackage = "middleware"
)
