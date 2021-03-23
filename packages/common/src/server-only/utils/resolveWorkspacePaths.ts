import * as path from "path";

import { InternalJobEntityId } from "../value-objects/EntityId";

export const resolveWorkspacePath = (
	internalJobEntityId: InternalJobEntityId
): string =>
	path.resolve(
		process.env.CCX_WORKSPACE as string,
		internalJobEntityId.toHexString()
	);

const resolveWorkspacePaths = (
	internalJobEntityId: InternalJobEntityId
): {
	workspace: string;
	repo: string;
	artifacts: string;
} => {
	const workspace = resolveWorkspacePath(internalJobEntityId);
	return {
		workspace,
		repo: path.resolve(workspace, "repo"),
		artifacts: path.resolve(workspace, "artifacts")
	};
};

export default resolveWorkspacePaths;
