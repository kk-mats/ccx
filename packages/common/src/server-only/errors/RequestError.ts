import * as Boom from "@hapi/boom";

import ErrorBase from "../../all/types/ErrorBase";

const missingParameterErrorMessage = "Missing a request parameter";

class RequestError extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static missingParameter(queryField: string): RequestError {
		return new RequestError(
			Boom.badRequest(missingParameterErrorMessage),
			undefined,
			queryField
		);
	}

	public static invalidValue(
		queryValue?: unknown,
		queryField?: string
	): RequestError {
		return new RequestError(
			Boom.badData("Invalid value"),
			queryValue,
			queryField
		);
	}

	public static unknownError(
		queryValue?: unknown,
		queryField?: string,
		message?: string
	): RequestError {
		return new RequestError(
			Boom.badRequest(message || "Invalid request"),
			queryValue,
			queryField
		);
	}
}

export default RequestError;
