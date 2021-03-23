import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";
import { projectNameLimitation } from "common/all/constants/limitations/project";

const tooShortProjectNameErrorMessage = `Project name must be at least ${projectNameLimitation.minlength} characters.`;
const tooLongProjectNameErrorMessage = `Project name must be ${projectNameLimitation.maxlength} characters or less.`;
const invalidProjectNameErrorMessage = `Project name must begin with "`;
const unavailableProjectNameErrorMessage = `Unavailable project name`;
const projectNotFoundErrorMessage = `Project not found`;

export default class ProjectNameError extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static tooShortProjectName(
		queryValue: string,
		queryField?: string
	): ProjectNameError {
		return new ProjectNameError(
			Boom.badRequest(tooShortProjectNameErrorMessage),
			queryValue,
			queryField
		);
	}

	public static tooLongProjectName(
		queryValue: string,
		queryField?: string
	): ProjectNameError {
		return new ProjectNameError(
			Boom.badRequest(tooLongProjectNameErrorMessage),
			queryValue,
			queryField
		);
	}

	public static invalidProjectName(
		queryValue: string,
		queryField?: string
	): ProjectNameError {
		return new ProjectNameError(
			Boom.badRequest(invalidProjectNameErrorMessage),
			queryValue,
			queryField
		);
	}

	public static unavailableProjectName(
		queryValue: string,
		queryField?: string
	): ProjectNameError {
		return new ProjectNameError(
			Boom.conflict(unavailableProjectNameErrorMessage),
			queryValue,
			queryField
		);
	}

	public static projectNotFound(
		queryValue: string,
		queryField?: string
	): ProjectNameError {
		return new ProjectNameError(
			Boom.notFound(projectNotFoundErrorMessage),
			queryValue,
			queryField
		);
	}
}
