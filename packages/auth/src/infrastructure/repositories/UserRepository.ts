import { MongoError } from "mongodb";

import RequestError from "common/server-only/errors/RequestError";
import UserIdError from "common/server-only/errors/UserIdError";
import UserId from "common/server-only/value-objects/UserId";

import UserEntity from "domain/UserEntity";
import EncryptedPassword from "domain/value-objects/EncryptedPassword";
import UserModel from "infrastructure/models/UserModel";
import { InternalUserEntityId } from "common/server-only/value-objects/EntityId";

class UserRepository {
	public static async create(
		userId: UserId,
		password: EncryptedPassword
	): Promise<UserEntity> {
		try {
			const document = await UserModel.create({
				userId,
				password
			});
			return new UserEntity(document);
		} catch (err) {
			if (err instanceof MongoError && err.code === 11000) {
				throw UserIdError.unavailableUserId(userId, "userId");
			}
			throw err;
		}
	}

	public static async delete(userId: UserId): Promise<void> {
		const result = await UserModel.deleteOne({
			userId
		});

		if (!result.ok) {
			throw RequestError.unknownError(
				userId,
				undefined,
				"Failed to delete account due to unknown error"
			);
		}
	}

	public static async findByUserId(
		userId: string
	): Promise<UserEntity | null> {
		const document = await UserModel.findOne({
			userId
		}).exec();

		return document && new UserEntity(document);
	}

	public static async findByUserEntityId(
		userEntityId: InternalUserEntityId
	): Promise<UserEntity | null> {
		const document = await UserModel.findById(userEntityId).exec();

		return document && new UserEntity(document);
	}
}

export default UserRepository;
