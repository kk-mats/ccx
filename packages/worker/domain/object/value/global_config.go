package value

type PrimeConfig struct {
	ApiAddr string `binding:"required"`
	GitAddr string `binding:"required"`
}

type WorkerConfig struct {
	WorkerType *WorkerType
	*CliConfig
}

type GlobalConfig struct {
	Prime  PrimeConfig
	Worker WorkerConfig
}

func NewGlobalConfig(prime PrimeConfig, cli *CliConfig, wt *WorkerType) *GlobalConfig {
	return &GlobalConfig{
		Prime:  prime,
		Worker: WorkerConfig{wt, cli},
	}
}
