import ProjectUpdated from "common/all/types/ProjectUpdated";
import ProjectLastUpdated from "common/all/types/ProjectLastUpdated";

export function createProjectLastUpdated(
	value: ProjectUpdated
): ProjectLastUpdated {
	return (value as Date) as ProjectLastUpdated;
}

// eslint-disable-next-line no-undef
export default ProjectLastUpdated;
