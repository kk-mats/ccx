import RequestError from "common/server-only/errors/RequestError";
import UserRepository from "infrastructure/repositories/UserRepository";

import UserId, { createUserId } from "common/server-only/value-objects/UserId";
import UserIdError from "common/server-only/errors/UserIdError";

class CheckingUserId {
	readonly userId: UserId;

	constructor(userId?: string) {
		if (!userId) {
			throw RequestError.missingParameter("userId");
		}

		this.userId = createUserId(userId);
	}

	public async exec(): Promise<UserId> {
		const user = await UserRepository.findByUserId(this.userId);
		if (user) {
			throw UserIdError.unavailableUserId(this.userId, "userId");
		}
		return this.userId;
	}
}

export default CheckingUserId;
