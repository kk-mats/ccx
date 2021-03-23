import { JobDocument } from "common/server-only/models/JobModel";
import InternalJobEntity from "common/server-only/types/InternalJobEntity";

function createInternalJobEntity(document: JobDocument): InternalJobEntity {
	return {
		internalJobEntityId: document._id,
		internalUserEntityId: document.internalUserEntityId,
		internalProjectEntityId: document.internalProjectEntityId,
		internalHistoryEntityId: document.internalHistoryEntityId,
		workerBaseUrl: document.workerBaseUrl,
		targets: document.targets,
		plugin: document.plugin,
		args: document.args
	};
}

// eslint-disable-next-line no-undef
export default createInternalJobEntity;
