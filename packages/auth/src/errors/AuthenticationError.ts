import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";

const invalidUserIdOrPasswordErrorMessage = "Incorrect user ID or password";
const couldNotAuthenticateErrorMessage = "Could not authenticate";

class AuthenticationError extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static invalidUserIdOrPassword(
		queryField?: string
	): AuthenticationError {
		return new AuthenticationError(
			Boom.badRequest(invalidUserIdOrPasswordErrorMessage),
			undefined,
			queryField || "userId | password"
		);
	}

	public static couldNotAuthenticated(): AuthenticationError {
		return new AuthenticationError(
			Boom.forbidden(couldNotAuthenticateErrorMessage),
			undefined,
			undefined
		);
	}
}

export default AuthenticationError;
