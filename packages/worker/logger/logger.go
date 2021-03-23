package logger

import (
	"io"
	"log"
	"os"

	"github.com/comail/colog"
)

func Init() {
	file, err := os.OpenFile("err.log", os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0777)

	if err != nil {
		panic(err)
	}
	mw := io.MultiWriter(os.Stdout, file)
	log.SetOutput(mw)

	colog.SetFormatter(&colog.StdFormatter{
		Colors: true,
		Flag:   log.Ldate | log.Ltime | log.Llongfile,
	})
	colog.SetDefaultLevel(colog.LInfo)
	colog.Register()
}
