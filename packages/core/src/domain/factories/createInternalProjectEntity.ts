import ProjectEntity from "common/all/types/ProjectEntity";

import createInternalHistoryEntity from "domain/factories/createInternalHistoryEntity";
import createInternalProjectSource, {
	createProjectSource
} from "domain/factories/createInternalProjectSource";
import InternalProjectEntity from "common/server-only/types/InternalProjectEntity";
import { ProjectDocument } from "common/server-only/models/ProjectModel";

function createInternalProjectEntity(
	document: ProjectDocument
): InternalProjectEntity {
	return {
		internalProjectEntityId: document._id,
		ownerId: document.ownerId,
		name: document.name,
		source: createInternalProjectSource(document.source),
		created: document.created,
		lastUpdated: document.lastUpdated,
		histories: document.histories.map((history) =>
			createInternalHistoryEntity(history)
		)
	};
}

export function createProjectEntity(
	internalEntity: InternalProjectEntity
): ProjectEntity {
	return {
		name: internalEntity.name,
		source: createProjectSource(internalEntity.source),
		created: internalEntity.created,
		lastUpdated: internalEntity.lastUpdated
	};
}

// eslint-disable-next-line no-undef
export default createInternalProjectEntity;
