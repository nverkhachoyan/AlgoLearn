package logger

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github.com/sirupsen/logrus"
)

type Logger struct {
	*logrus.Logger
}

var log *Logger

type Config struct {
	LogLevel      string
	Environment   string
	LogToFile     bool
	LogFilePath   string
	LogToConsole  bool
	ReportCaller  bool
	JSONFormatter bool
}

func Initialize(config Config) error {
	logger := logrus.New()

	level, err := logrus.ParseLevel(config.LogLevel)
	if err != nil {
		return fmt.Errorf("invalid log level: %v", err)
	}
	logger.SetLevel(level)

	if config.Environment == "development" {
		logger.SetFormatter(&ColoredFormatter{
			TimestampFormat: "2006-01-02 15:04:05",
		})

		if config.LogToFile {
			file, err := os.OpenFile(config.LogFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
			if err != nil {
				return fmt.Errorf("failed to open log file: %v", err)
			}

			jsonFormatter := &logrus.JSONFormatter{
				TimestampFormat: time.RFC3339,
				CallerPrettyfier: func(f *runtime.Frame) (string, string) {
					filename := filepath.Base(f.File)
					return "", fmt.Sprintf("%s:%d", filename, f.Line)
				},
			}
			logger.AddHook(NewFileHook(file, jsonFormatter))
		}
	} else {
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
			CallerPrettyfier: func(f *runtime.Frame) (string, string) {
				filename := filepath.Base(f.File)
				return "", fmt.Sprintf("%s:%d", filename, f.Line)
			},
		})
	}

	logger.SetOutput(os.Stdout)
	logger.SetReportCaller(config.ReportCaller)

	log = &Logger{logger}
	return nil
}

func Get() *Logger {
	if log == nil {
		return &Logger{logrus.StandardLogger()}
	}
	return log
}

func (l *Logger) WithBaseFields(logPackage LogPackage, functionName string) *logrus.Entry {
	return l.WithFields(Fields{
		"func":    functionName,
		"package": logPackage,
	})
}

func WithFields(entry *logrus.Entry, fields Fields) *logrus.Entry {
	return entry.WithFields(logrus.Fields(fields))
}

type Fields logrus.Fields

func (l *Logger) WithFields(fields Fields) *logrus.Entry {
	return l.Logger.WithFields(logrus.Fields(fields))
}

type FileHook struct {
	file      *os.File
	formatter logrus.Formatter
}

func NewFileHook(file *os.File, formatter logrus.Formatter) *FileHook {
	return &FileHook{
		file:      file,
		formatter: formatter,
	}
}

func (hook *FileHook) Levels() []logrus.Level {
	return logrus.AllLevels
}

func (hook *FileHook) Fire(entry *logrus.Entry) error {
	formatted, err := hook.formatter.Format(entry)
	if err != nil {
		return err
	}

	_, err = hook.file.Write(formatted)
	return err
}
