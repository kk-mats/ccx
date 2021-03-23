import { DetectQueryPlugin } from "common/server-only/types/plugin";
import { WorkerClient } from "domain/client/WorkerClient";
import { Worker, WorkerConfig } from "domain/entity/Worker";
import {
	WorkerMatchResult,
	WorkerRepository
} from "domain/repository/WorkerRepository";

export class WorkerInMemoryRepository implements WorkerRepository {
	private workerCache: Worker[] = [];

	public addWorker(client: WorkerClient, config: WorkerConfig): void {
		this.workerCache.push(new Worker(client, config.type));
	}

	public workers(): Worker[] {
		return this.workerCache;
	}

	public matchWorkers(plugin: DetectQueryPlugin): WorkerMatchResult[] {
		return this.workerCache
			.map((worker) => {
				const entrypoint = worker.match(plugin.environment);
				if (entrypoint !== null) {
					return { worker, entrypoint };
				}

				return null;
			})
			.filter((v): v is WorkerMatchResult => v !== null);
	}
}
