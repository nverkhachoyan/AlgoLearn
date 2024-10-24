// internal/pkg/logger/formatter.go
package logger

import (
	"bytes"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/sirupsen/logrus"
)

// Colors
const (
	Reset  = "\033[0m"
	Red    = "\033[31m"
	Green  = "\033[32m"
	Yellow = "\033[33m"
	Blue   = "\033[34m"
	Purple = "\033[35m"
	Cyan   = "\033[36m"
	Gray   = "\033[37m"
)

type ColoredFormatter struct {
	TimestampFormat string
	LevelDesc       []string
}

func (f *ColoredFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	var b *bytes.Buffer
	if entry.Buffer != nil {
		b = entry.Buffer
	} else {
		b = &bytes.Buffer{}
	}

	// Timestamp
	timestamp := entry.Time.Format(f.TimestampFormat)

	// Level
	levelText := strings.ToUpper(entry.Level.String())
	levelColor := getLevelColor(entry.Level)

	// Caller info
	var fileInfo string
	if entry.HasCaller() {
		fileInfo = fmt.Sprintf("%s:%d", filepath.Base(entry.Caller.File), entry.Caller.Line)
	}

	// Write colored output
	fmt.Fprintf(b, "%s%s%s %s%5s%s",
		Yellow, timestamp, Reset,
		levelColor, levelText, Reset)

	if fileInfo != "" {
		fmt.Fprintf(b, " %s%s%s", Cyan, fileInfo, Reset)
	}

	// Message
	fmt.Fprintf(b, " %s", entry.Message)

	// Fields
	if len(entry.Data) > 0 {
		fmt.Fprintf(b, " %sfields:%s", Blue, Reset)
		for k, v := range entry.Data {
			fmt.Fprintf(b, " %s%s%s=%v", Green, k, Reset, v)
		}
	}

	b.WriteByte('\n')
	return b.Bytes(), nil
}

func getLevelColor(level logrus.Level) string {
	switch level {
	case logrus.TraceLevel:
		return Gray
	case logrus.DebugLevel:
		return Blue
	case logrus.InfoLevel:
		return Green
	case logrus.WarnLevel:
		return Yellow
	case logrus.ErrorLevel, logrus.FatalLevel, logrus.PanicLevel:
		return Red
	default:
		return Reset
	}
}