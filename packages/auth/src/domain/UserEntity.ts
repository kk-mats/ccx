import UserId from "common/server-only/value-objects/UserId";

import EncryptedPassword from "domain/value-objects/EncryptedPassword";
import { DocumentType } from "infrastructure/models/UserModel";
import { InternalUserEntityId } from "common/server-only/value-objects/EntityId";

export default class UserEntity {
	readonly userEntityId: InternalUserEntityId;

	readonly userId: UserId;

	readonly password: EncryptedPassword;

	constructor(userDocument: DocumentType) {
		this.userEntityId = userDocument._id as InternalUserEntityId;
		this.userId = userDocument.userId as UserId;
		this.password = userDocument.password as EncryptedPassword;
	}
}
