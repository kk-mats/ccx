import logger from "utils/logger";
import { PluginFileSystemRepository } from "infrastructure/repositories/PluginFileSystemRepository";
import { GlobalConfig } from "domain/entity/GlobalConfig";
import { InitializationService } from "domain/services/InitializationService";
import { WorkerHttpClientFactory } from "infrastructure/factory/WorkerHttpClientFactory";
import { WorkerInMemoryRepository } from "infrastructure/repositories/WorkerInMemoryRepository";
import { Registry } from "types/registry";
import { TemporaryStoreFileSystemRepository } from "infrastructure/repositories/TemporalyStoreFileSystemRepository";
import { Executor } from "application/executor";

const main = async () => {
	const pluginRepository = await PluginFileSystemRepository.init(
		"/ccx-store"
	);
	pluginRepository.startGitDaemon();

	// await new Promise((resolve) => setTimeout(resolve, 5000));

	const registry: Registry = {
		workerClientFactory: new WorkerHttpClientFactory(),
		workerRepository: new WorkerInMemoryRepository(),
		globalConfig: new GlobalConfig(process.env),
		pluginRepository,
		temporaryStoreRepository: new TemporaryStoreFileSystemRepository()
	};

	const app = await new InitializationService().exec(registry);

	const server = app.listen(4000, () => {
		const address = server.address();
		if (!address) {
			logger.fatal(`Failed to start CCX Core server on port 4000`);
		} else if (typeof address === "string") {
			logger.info(`CCX Core server is running on ${address}`);
		} else {
			logger.info(
				`CCX Core server is running on [${address.address}]:${address.port}`
			);
		}
	});

	new Executor(registry).waitJob();

	process.on("unhandledRejection", (reason, promise) => {
		logger.fatal(`Unhandled rejection:
	${JSON.stringify(reason, undefined, 2)}
	${JSON.stringify(promise, undefined, 2)}`);
	});
};

main();
