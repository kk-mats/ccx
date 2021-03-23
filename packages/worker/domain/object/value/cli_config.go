package value

import (
	"flag"
)

// CliConfig config from command line arguments
type CliConfig struct {
	Port  uint
	Store string
}

func NewCliConfig(tmp string, args []string) (*CliConfig, error) {
	c := CliConfig{}

	cl := flag.NewFlagSet(args[0], flag.ExitOnError)

	cl.UintVar(&c.Port, "p", 3000, "Listen on an alternative port.")
	cl.StringVar(&c.Store, "s", tmp, "Path to the projects and plugins store directory.")

	err := cl.Parse(args[1:])

	return &c, err
}
