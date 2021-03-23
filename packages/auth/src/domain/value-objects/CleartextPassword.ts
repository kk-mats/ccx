import * as t from "io-ts";
import * as bcrypt from "bcrypt";

import { cleartextPassword } from "domain/codecs";
import { passwordLimitation } from "common/all/constants/limitations/user";

import PasswordError from "errors/PasswordError";
import EncryptedPassword from "domain/value-objects/EncryptedPassword";

type CleartextPassword = t.TypeOf<typeof cleartextPassword>;

export function createCleartextPassword(
	value: string,
	queryField?: string
): CleartextPassword {
	if (value.length < passwordLimitation.minlength) {
		throw PasswordError.tooShortPassword(queryField);
	}

	if (passwordLimitation.maxlength < value.length) {
		throw PasswordError.tooLongPassword(queryField);
	}

	if (!passwordLimitation.validator.test(value)) {
		throw PasswordError.invalidPassword(queryField);
	}

	return value as CleartextPassword;
}

export async function encrypt(
	value: CleartextPassword
): Promise<EncryptedPassword> {
	return bcrypt.hashSync(value, 8) as EncryptedPassword;
}

// eslint-disable-next-line no-undef
export default CleartextPassword;
