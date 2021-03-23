import { GlobalConfig } from "domain/entity/GlobalConfig";
import { WorkerClientFactory } from "domain/factory/WorkerClientFactory";
import { PluginRepository } from "domain/repository/PluginRepository";
import { WorkerRepository } from "domain/repository/WorkerRepository";
import { TemporaryStoreRepository } from "domain/repository/TemporaryStoreRepository";

export type Registry = {
	workerClientFactory: WorkerClientFactory;
	workerRepository: WorkerRepository;
	globalConfig: GlobalConfig;
	pluginRepository: PluginRepository;
	temporaryStoreRepository: TemporaryStoreRepository;
};
