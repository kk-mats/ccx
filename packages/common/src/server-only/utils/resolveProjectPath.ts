import * as path from "path";

import {
	InternalUserEntityId,
	InternalProjectEntityId
} from "../value-objects/EntityId";

const resolveProjectPath = (
	ownerId: InternalUserEntityId,
	projectEntityId: InternalProjectEntityId
): string => {
	return path.resolve(
		"/ccx-store",
		"projects",
		ownerId.toString(),
		projectEntityId.toString()
	);
};

export default resolveProjectPath;
