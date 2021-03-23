import * as path from "path";

import {
	InternalUserEntityId,
	InternalProjectEntityId
} from "../value-objects/EntityId";
import resolveProjectPath from "./resolveProjectPath";

const resolveChildrenPaths = (
	ownerId: InternalUserEntityId,
	internalProjectEntityId: InternalProjectEntityId
): { repo: string; histories: string } => {
	const parent = resolveProjectPath(ownerId, internalProjectEntityId);

	return {
		repo: path.resolve(parent, "repo"),
		histories: path.resolve(parent, "histories")
	};
};

export default resolveChildrenPaths;
