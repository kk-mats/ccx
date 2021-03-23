import { WorkerClient } from "domain/client/WorkerClient";

export interface WorkerClientFactory {
	create(baseUrl: string): WorkerClient;
}
