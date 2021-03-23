import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";

import {
	invalidGitURLErrorMessage,
	unsupportedGitProtocolErrorMessage
} from "common/all/errorMessages";

export default class GitURLError extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static invalidGitURL(
		queryValue: string,
		queryField?: string
	): GitURLError {
		return new GitURLError(
			Boom.badRequest(invalidGitURLErrorMessage),
			queryValue,
			queryField
		);
	}

	public static unsupportedGitProtocol(
		queryValue: string,
		queryField?: string
	): GitURLError {
		return new GitURLError(
			Boom.badRequest(unsupportedGitProtocolErrorMessage),
			queryValue,
			queryField
		);
	}
}
