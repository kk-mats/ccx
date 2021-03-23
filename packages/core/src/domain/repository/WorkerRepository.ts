import { MixedPluginEnvironment } from "common/all/types/plugin";
import { DetectQueryPlugin } from "common/server-only/types/plugin";
import { WorkerClient } from "domain/client/WorkerClient";
import { Worker, WorkerConfig } from "domain/entity/Worker";

export type WorkerMatchResult = {
	worker: Worker;
	entrypoint: MixedPluginEnvironment;
};

export interface WorkerRepository {
	addWorker(client: WorkerClient, config: WorkerConfig): void;

	workers(): Worker[];

	matchWorkers(plugin: DetectQueryPlugin): WorkerMatchResult[];
}
