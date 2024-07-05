package config

import (
	"os"

	"bytes"
	"fmt"
	"time"

	"algolearn-backend/pkg/colors"

	"github.com/sirupsen/logrus"
)

var Log *logrus.Logger

type CustomFormatter struct {
	TimestampFormat string
	FullTimestamp   bool
	ForceColors     bool
}

func (f *CustomFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	var b bytes.Buffer

	if f.FullTimestamp {
		_ =entry.Time.Format(f.TimestampFormat)
	} else {
		_ = entry.Time.Format(time.Stamp)
	}

	if f.ForceColors {
		b.WriteString(fmt.Sprintf("\x1b[36m%s\x1b[0m\t", entry.Time.Format(f.TimestampFormat)))
	} else {
		b.WriteString(fmt.Sprintf("%s\n", entry.Time.Format(f.TimestampFormat)))
	}

	b.WriteString(fmt.Sprintf(colors.Green + "%s\n" + colors.Reset, entry.Level.String()))
	b.WriteString(fmt.Sprintf("%s\n", entry.Message))

	for key, value := range entry.Data {
		b.WriteString(fmt.Sprintf("%s: %v\n", key, value))
	}

	b.WriteByte('\n')
	return b.Bytes(), nil
}

func InitLogger() {
	Log = logrus.New()
	Log.Out = os.Stdout
	Log.SetFormatter(&CustomFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
		FullTimestamp:   true,
		ForceColors:     true,
	})
	Log.SetLevel(logrus.InfoLevel)
}

