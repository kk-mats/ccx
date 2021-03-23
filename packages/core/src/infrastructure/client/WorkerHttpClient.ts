import got, { Got } from "got";
import * as stream from "stream";

import logger from "utils/logger";
import { DetectQuery, WorkerClient } from "domain/client/WorkerClient";
import { WorkerConfig } from "domain/entity/Worker";
import { InternalJobEntityId } from "common/server-only/value-objects/EntityId";

export class WorkerHttpClient implements WorkerClient {
	private client: Got;

	constructor(private baseUrl: string) {
		this.client = got.extend({
			prefixUrl: `http://${this.baseUrl}`,
			throwHttpErrors: false,
			responseType: "json",
			retry: 0
		});
	}

	public async detect(query: DetectQuery): Promise<Buffer | null> {
		const res = await this.client.post("detect", {
			json: query,
			responseType: "buffer"
		});
		switch (res.statusCode) {
			case 200: {
				return res.body;
			}

			default: {
				return null;
			}
		}
	}

	public async abort(
		internalJobEntityId: InternalJobEntityId
	): Promise<boolean> {
		const res = await this.client.delete(
			`jobs/${internalJobEntityId.toHexString()}`
		);

		switch (res.statusCode) {
			case 200: {
				return true;
			}

			default: {
				return false;
			}
		}
	}

	public async initialize(
		apiAddr: string,
		gitAddr: string
	): Promise<WorkerConfig | null> {
		try {
			const res = await this.client.post<WorkerConfig>("", {
				json: { apiAddr, gitAddr },
				timeout: 5 * 1000,
				retry: 2
			});

			if (res.statusCode === 200) {
				return res.body;
			}
		} catch (err) {
			console.log(err);
		}
		return null;
	}
}
