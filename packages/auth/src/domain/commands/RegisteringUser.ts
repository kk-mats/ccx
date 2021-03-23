import RequestError from "common/server-only/errors/RequestError";
import UserId, { createUserId } from "common/server-only/value-objects/UserId";

import UserRepository from "infrastructure/repositories/UserRepository";
import UserEntity from "domain/UserEntity";
import CleartextPassword, {
	createCleartextPassword,
	encrypt
} from "domain/value-objects/CleartextPassword";

class RegisteringUser {
	readonly userId: UserId;

	readonly password: CleartextPassword;

	constructor(userId?: string, password?: string) {
		if (!userId) {
			throw RequestError.missingParameter("userId");
		}

		if (!password) {
			throw RequestError.missingParameter("password");
		}

		this.userId = createUserId(userId, "userId");
		this.password = createCleartextPassword(password, "password");
	}

	public async exec(): Promise<UserEntity> {
		return UserRepository.create(this.userId, await encrypt(this.password));
	}
}

export default RegisteringUser;
