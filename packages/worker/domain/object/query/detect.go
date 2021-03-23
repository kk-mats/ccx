package query

type Parameters map[string]interface{}

// Querent is an id of the user who sent the query
type Querent string

// ID is an id of the query
type ID string

// Project is an ID of a project
type Project string

// ProjectDirectory is a relative path from the project root
type ProjectDirectory string

// ProjectRevision is a string of the project revision
type ProjectRevision string

// Target directory and revision of a project
type Target struct {
	Directory ProjectDirectory `json:"directory"`
	Revision  ProjectRevision  `json:"revision"`
}

type DetectorVersion string

type Args struct {
	DetectorVersion DetectorVersion
	Parameters      Parameters
}

type Detect struct {
	ID      ID
	User    Querent
	Plugin  Plugin
	Project Project
	Targets []Target
	Args    Args
}
