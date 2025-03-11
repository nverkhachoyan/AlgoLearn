package logger

import (
	"algolearn/pkg/colors"
	"bytes"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/sirupsen/logrus"
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

	timestamp := entry.Time.Format(f.TimestampFormat)

	levelText := strings.ToUpper(entry.Level.String())
	levelColor := getLevelColor(entry.Level)

	var fileInfo string
	if entry.HasCaller() {
		fileInfo = fmt.Sprintf("%s:%d", filepath.Base(entry.Caller.File), entry.Caller.Line)
	}

	_, _ = fmt.Fprintf(b, "%s%s%s %s%5s%s",
		colors.Yellow, timestamp, colors.Reset,
		levelColor, levelText, colors.Reset)

	if fileInfo != "" {
		fmt.Fprintf(b, " %s%s%s", colors.Cyan, fileInfo, colors.Reset)
	}

	fmt.Fprintf(b, " %s", entry.Message)

	if len(entry.Data) > 0 {
		fmt.Fprintf(b, " %sfields:%s", colors.Blue, colors.Reset)
		for k, v := range entry.Data {
			_, _ = fmt.Fprintf(b, " %s%s%s=%v", colors.Green, k, colors.Reset, v)
		}
	}

	b.WriteByte('\n')
	return b.Bytes(), nil
}

func getLevelColor(level logrus.Level) string {
	switch level {
	case logrus.TraceLevel:
		return colors.Gray
	case logrus.DebugLevel:
		return colors.Blue
	case logrus.InfoLevel:
		return colors.Green
	case logrus.WarnLevel:
		return colors.Yellow
	case logrus.ErrorLevel, logrus.FatalLevel, logrus.PanicLevel:
		return colors.Red
	default:
		return colors.Reset
	}
}
