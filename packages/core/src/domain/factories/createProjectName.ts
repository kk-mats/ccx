import { projectNameLimitation } from "common/all/constants/limitations/project";
import ProjectName from "common/all/types/ProjectName";
import ProjectNameError from "errors/ProjectNameError";

export default function createProjectName(
	value: string,
	queryField?: string
): ProjectName {
	if (value.length < projectNameLimitation.minlength) {
		throw ProjectNameError.tooShortProjectName(value, queryField);
	}

	if (projectNameLimitation.maxlength < value.length) {
		throw ProjectNameError.tooLongProjectName(value, queryField);
	}

	if (!projectNameLimitation.validator.test(value)) {
		throw ProjectNameError.invalidProjectName(value, queryField);
	}

	return value as ProjectName;
}
