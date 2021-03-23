import RequestError from "common/server-only/errors/RequestError";
import UserRepository from "infrastructure/repositories/UserRepository";
import UserEntity from "domain/UserEntity";
import { compare } from "domain/value-objects/EncryptedPassword";

class AuthenticatingUser {
	readonly userId: string;

	readonly password: string;

	constructor(userId?: string, password?: string) {
		if (!userId) {
			throw RequestError.missingParameter("userId");
		}

		if (!password) {
			throw RequestError.missingParameter("password");
		}

		this.userId = userId;
		this.password = password;
	}

	public async exec(): Promise<UserEntity | null> {
		const user = await UserRepository.findByUserId(this.userId);
		return user && (await compare(user.password, this.password))
			? user
			: null;
	}
}

export default AuthenticatingUser;
