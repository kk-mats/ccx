import * as Boom from "@hapi/boom";

import ErrorBase from "../../all/types/ErrorBase";
import {
	tooShortUserIdErrorMessage,
	tooLongUserIdErrorMessage,
	invalidUserIdErrorMessage,
	unavailableUserIdErrorMessage
} from "../../all/errorMessages";

class UserIdError extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(boom: Boom.Boom, userId: string, queryField?: string) {
		super(boom, userId, queryField);
	}

	public static tooShortUserId(
		userId: string,
		queryField?: string
	): UserIdError {
		return new UserIdError(
			Boom.badRequest(tooShortUserIdErrorMessage),
			userId,
			queryField
		);
	}

	public static tooLongUserId(
		userId: string,
		queryField?: string
	): UserIdError {
		return new UserIdError(
			Boom.badRequest(tooLongUserIdErrorMessage),
			userId,
			queryField
		);
	}

	public static invalidUserId(
		userId: string,
		queryField?: string
	): UserIdError {
		return new UserIdError(
			Boom.badRequest(invalidUserIdErrorMessage),
			userId,
			queryField
		);
	}

	public static unavailableUserId(
		userId: string,
		queryField?: string
	): UserIdError {
		return new UserIdError(
			Boom.conflict(unavailableUserIdErrorMessage),
			userId,
			queryField
		);
	}
}

export default UserIdError;
