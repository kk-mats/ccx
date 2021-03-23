import Artifact from "common/all/types/Artifact";
import HistoryId from "common/all/types/HistoryId";
import HistoryEntity from "common/all/types/HistoryEntity";

import InternalHistoryEntity from "common/server-only/types/InternalHistoryEntity";
import { HistoryDocument } from "common/server-only/models/HistoryModel";

function createInternalHistoryEntity(
	document: HistoryDocument
): InternalHistoryEntity {
	return {
		internalHistoryEntityId: document._id,
		dispatched: document.dispatched as InternalHistoryEntity["dispatched"],
		started: document.started,
		finished: document.finished,
		request: document.request,
		status: document.status,
		summaries: document.summaries
	};
}

export function createHistoryEntity(
	internalEntity: InternalHistoryEntity,
	artifacts: string[]
): HistoryEntity {
	return {
		historyId: internalEntity.internalHistoryEntityId.toHexString() as HistoryId,
		dispatched: internalEntity.dispatched,
		started: internalEntity.started,
		finished: internalEntity.finished,
		request: internalEntity.request,
		status: internalEntity.status,
		artifacts: artifacts as Artifact[],
		summaries: internalEntity.summaries
	};
}

export default createInternalHistoryEntity;
