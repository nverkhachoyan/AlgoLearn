package config

import (
	"bytes"
	"fmt"
	"os"

	"algolearn-backend/pkg/colors"

	"github.com/sirupsen/logrus"
)

var Log *logrus.Logger

type CustomFormatter struct {
	TimestampFormat string
	ForceColors     bool
}

func (f *CustomFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	var b bytes.Buffer

	// Format timestamp
	timestamp := entry.Time.Format(f.TimestampFormat)

	// Add timestamp to log entry
	if f.ForceColors {
		b.WriteString(fmt.Sprintf("\x1b[36m%s\x1b[0m\t", timestamp)) // Cyan color for timestamp
	} else {
		b.WriteString(fmt.Sprintf("%s\t", timestamp))
	}

	// Add log level in green
	b.WriteString(fmt.Sprintf(colors.Green+"%s\t"+colors.Reset, entry.Level.String()))

	// Add the log message
	b.WriteString(fmt.Sprintf("%s\n", entry.Message))

	// Add key-value pairs if any
	for key, value := range entry.Data {
		b.WriteString(fmt.Sprintf("%s: %v\t", key, value))
	}

	return b.Bytes(), nil
}

func InitLogger() {
	Log = logrus.New()
	Log.Out = os.Stdout
	Log.SetFormatter(&CustomFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
		ForceColors:     true,
	})

	logLevel := os.Getenv("LOG_LEVEL")
	if logLevel == "DEBUG" {
		Log.SetLevel(logrus.DebugLevel)
	} else {
		Log.SetLevel(logrus.InfoLevel)
	}

}
