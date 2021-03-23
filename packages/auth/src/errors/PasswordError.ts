import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";
import {
	tooShortPasswordErrorMessage,
	tooLongPasswordErrorMessage,
	invalidPasswordErrorMessage
} from "common/all/errorMessages";
import { passwordLimitation } from "common/all/constants/limitations/user";

class PasswordError extends ErrorBase {
	private constructor(boom: Boom.Boom, queryField?: string) {
		super(boom, undefined, queryField);
	}

	public static tooShortPassword(queryField?: string): PasswordError {
		return new PasswordError(
			Boom.badRequest(tooShortPasswordErrorMessage),
			queryField
		);
	}

	public static tooLongPassword(queryField?: string): PasswordError {
		return new PasswordError(
			Boom.badRequest(tooLongPasswordErrorMessage),
			queryField
		);
	}

	public static invalidPassword(queryField?: string): PasswordError {
		return new PasswordError(
			Boom.badRequest(invalidPasswordErrorMessage),
			queryField
		);
	}
}

export default PasswordError;
