import * as t from "io-ts";
import * as bcrypt from "bcrypt";

import { encryptedPassword } from "domain/codecs";

type EncryptedPassword = t.TypeOf<typeof encryptedPassword>;

export async function compare(
	value: EncryptedPassword,
	password: string
): Promise<boolean> {
	return bcrypt.compare(password, value);
}

// eslint-disable-next-line no-undef
export default EncryptedPassword;
