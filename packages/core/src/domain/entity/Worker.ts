import {
	MixedPluginEnvironment,
	PluginEnvironment
} from "common/all/types/plugin";
import { WorkerClient } from "domain/client/WorkerClient";
import * as t from "io-ts";

const workerType = t.keyof({
	windows: null,
	linux: null,
	"windows-docker": null,
	"linux-docker": null
});

export type WorkerType = t.TypeOf<typeof workerType>;

export const workerConfig = t.type({
	type: workerType
});

export type WorkerConfig = t.TypeOf<typeof workerConfig>;

export class Worker {
	constructor(readonly client: WorkerClient, readonly type: WorkerType) {}

	// eslint-disable-next-line consistent-return
	public match(
		environment: MixedPluginEnvironment
	): MixedPluginEnvironment | null {
		// docker worker has a priority to non-docker workers
		switch (this.type) {
			case "linux-docker": {
				return environment.linux?.dockerfile === undefined
					? null
					: {
							linux: {
								dockerfile: environment.linux.dockerfile
							}
					  };
			}

			case "windows-docker": {
				return environment.windows?.dockerfile === undefined
					? null
					: {
							windows: {
								dockerfile: environment.windows.dockerfile
							}
					  };
			}

			case "linux": {
				return environment.linux?.command === undefined
					? null
					: {
							linux: {
								command: environment.linux.command
							}
					  };
			}

			case "windows": {
				return environment.windows?.command === undefined
					? null
					: {
							windows: {
								command: environment.windows.command
							}
					  };
			}
		}
	}
}
