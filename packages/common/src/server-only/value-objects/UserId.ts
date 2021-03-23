import * as t from "io-ts";

import { userIdLimitation } from "../../all/constants/limitations/user";
import { userId } from "../../all/codecs";
import UserIdError from "../errors/UserIdError";

type UserId = t.TypeOf<typeof userId>;

export function createUserId(value: string, queryField?: string): UserId {
	if (value.length < userIdLimitation.minlength) {
		throw UserIdError.tooShortUserId(value, queryField);
	}

	if (userIdLimitation.maxlength < value.length) {
		throw UserIdError.tooLongUserId(value, queryField);
	}

	if (!userIdLimitation.validator.test(value)) {
		throw UserIdError.invalidUserId(value, queryField);
	}

	return value as UserId;
}

// eslint-disable-next-line no-undef
export default UserId;
