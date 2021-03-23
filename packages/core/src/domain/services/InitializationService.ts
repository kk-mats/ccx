/* eslint-disable class-methods-use-this */
import express from "express";
import mongoose from "mongoose";

import errorHandler from "common/server-only/middlewares/errorHandler";

import logger from "utils/logger";
import { Registry } from "types/registry";
import controllers from "application/controllers";

export class InitializationService {
	private async initializeWorker(
		baseUrl: string,
		registry: Registry
	): Promise<boolean> {
		const client = registry.workerClientFactory.create(baseUrl);
		const config = await client.initialize(
			registry.globalConfig.get("apiAddr"),
			registry.globalConfig.get("gitAddr")
		);

		if (config) {
			registry.workerRepository.addWorker(client, config);
			return true;
		}

		logger.warn(`failed to initialize worker ${baseUrl}.`);
		return false;
	}

	private async initializeWorkers(registry: Registry): Promise<void> {
		const connected = await Promise.all(
			registry.globalConfig
				.get("workers")
				.map((worker) => this.initializeWorker(worker, registry))
		);

		if (connected.every((v) => !v)) {
			throw new Error("failed to initialize all workers.");
		}
	}

	private async initializeDb(registry: Registry): Promise<void> {
		mongoose.set("debug", process.env.NODE_ENV === "development");

		mongoose.connection.on("connected", () => {
			logger.info("Mongoose default connection is open.");
		});

		mongoose.connection.on("error", (err) => {
			logger.fatal(`Mongoose default connection has occurred:
			${JSON.stringify(err, undefined, 2)}`);
		});

		mongoose.connection.on("disconnected", () => {
			logger.info("Mongoose default connection is disconnected.");
		});

		mongoose.connect(registry.globalConfig.get("dbUri"), {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});
	}

	private initializeServer(registry: Registry): express.Express {
		const server = express();
		server.set("x-powered-by", false);
		server.set("query parser", "extended");

		server.use(express.json());
		server.use(express.urlencoded({ extended: true }));

		server.use(controllers(registry));
		server.use(errorHandler(logger));

		return server;
	}

	public async exec(registry: Registry): Promise<express.Express> {
		await Promise.all([
			this.initializeWorkers(registry),
			this.initializeDb(registry)
		]);
		return this.initializeServer(registry);
	}
}
