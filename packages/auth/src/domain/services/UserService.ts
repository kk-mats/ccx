import UserRepository from "infrastructure/repositories/UserRepository";
import UserEntity from "domain/UserEntity";
import { InternalUserEntityId } from "common/server-only/value-objects/EntityId";

export default class UserService {
	public static async findByUserEntityId(
		internalUserEntityId: InternalUserEntityId
	): Promise<UserEntity | null> {
		return UserRepository.findByUserEntityId(internalUserEntityId);
	}
}
