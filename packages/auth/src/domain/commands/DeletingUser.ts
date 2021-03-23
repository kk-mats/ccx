import PasswordError from "errors/PasswordError";
import UserEntity from "domain/UserEntity";
import { compare } from "domain/value-objects/EncryptedPassword";
import UserRepository from "infrastructure/repositories/UserRepository";

class DeletingUser {
	constructor(private userEntity: UserEntity, private password: string) {
		this.userEntity = userEntity;
	}

	public async exec(): Promise<void> {
		if (!compare(this.userEntity.password, this.password)) {
			throw PasswordError.invalidPassword("password");
		}

		await UserRepository.delete(this.userEntity.userId);
	}
}

export default DeletingUser;
