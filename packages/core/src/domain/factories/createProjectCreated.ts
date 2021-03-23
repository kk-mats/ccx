import ProjectCreated from "common/all/types/ProjectCreated";

function createProjectCreated(value: Date): ProjectCreated {
	return value as ProjectCreated;
}

export default createProjectCreated;
