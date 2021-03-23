import HistoryEntityForClient from "common/all/types/HistoryEntityForClient";
import InternalHistoryEntity from "common/server-only/types/InternalHistoryEntity";
import { createHistoryEntity } from "domain/factories/createInternalHistoryEntity";

function createHistoryEntityForClient(
	internalHistoryEntity: InternalHistoryEntity,
	artifacts: string[]
): HistoryEntityForClient {
	return {
		...createHistoryEntity(internalHistoryEntity, artifacts),
		dispatched: internalHistoryEntity.dispatched.toISOString(),
		started: internalHistoryEntity.started?.toISOString(),
		finished: internalHistoryEntity.finished?.toISOString()
	};
}

export default createHistoryEntityForClient;
