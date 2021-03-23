import { WorkerClientFactory } from "domain/factory/WorkerClientFactory";
import { WorkerHttpClient } from "infrastructure/client/WorkerHttpClient";

export class WorkerHttpClientFactory implements WorkerClientFactory {
	// eslint-disable-next-line class-methods-use-this
	public create(baseUrl: string): WorkerHttpClient {
		return new WorkerHttpClient(baseUrl);
	}
}
