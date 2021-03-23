package value

type WorkerType string

const (
	Windows       WorkerType = "windows"
	Linux         WorkerType = "linux"
	WindowsDocker WorkerType = "windows-docker"
	LinuxDocker   WorkerType = "linux-docker"
	Unknown       WorkerType = "unknown"
)
