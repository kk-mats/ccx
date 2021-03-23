import * as stream from "stream";
import { WorkerConfig } from "domain/entity/Worker";
import {
	InternalJobEntityId,
	InternalProjectEntityId,
	InternalUserEntityId
} from "common/server-only/value-objects/EntityId";
import { MixedPluginEnvironment, Plugin } from "common/all/types/plugin";
import DetectionTarget from "common/all/types/DetectionTarget";
import DetectorVersion from "common/all/types/DetectorVersion";
import { DetectionParameters } from "common/all/types/parameters";

export type DetectQuery = {
	id: InternalJobEntityId;
	user: InternalUserEntityId;
	plugin: Plugin & {
		entrypoint: MixedPluginEnvironment;
	};
	project: InternalProjectEntityId;
	targets: DetectionTarget[];
	args: {
		detectorVersion: DetectorVersion;
		parameters: DetectionParameters;
	};
};

export interface WorkerClient {
	detect(query: DetectQuery): Promise<Buffer | null>;

	abort(internalJobEntityId: InternalJobEntityId): Promise<boolean>;

	initialize(apiAddr: string, gitAddr: string): Promise<WorkerConfig | null>;
}
