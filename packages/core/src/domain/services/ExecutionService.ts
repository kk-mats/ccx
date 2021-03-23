import InternalJobEntity from "common/server-only/types/InternalJobEntity";
import JobRepository from "infrastructure/repositories/JobRepository";
import ProjectRepository from "infrastructure/repositories/ProjectRepository";
import { Registry } from "types/registry";
import logger from "utils/logger";
import { WorkerMatchResult } from "domain/repository/WorkerRepository";
import { DetectQuery } from "domain/client/WorkerClient";
import DetectionResultSummary from "common/all/types/DetectionResultSummary";

export class ExecutionService {
	constructor(readonly registry: Registry) {}

	private static async findJob(): Promise<InternalJobEntity | null> {
		const jobs = await JobRepository.all();

		if (jobs.length < 1) {
			return null;
		}

		return jobs[0];
	}

	private async findWorker(
		job: InternalJobEntity
	): Promise<WorkerMatchResult | null> {
		const results = this.registry.workerRepository.matchWorkers(job.plugin);

		if (results.length < 1) {
			return null;
		}

		return results[0];
	}

	private async sendQuery(job: InternalJobEntity): Promise<Buffer | null> {
		const matched = await this.findWorker(job);
		if (!matched) {
			return null;
		}
		const { worker, entrypoint } = matched;

		await ProjectRepository.setRunning(
			job.internalProjectEntityId,
			job.internalHistoryEntityId
		);

		const query: DetectQuery = {
			id: job.internalJobEntityId,
			user: job.internalUserEntityId,
			project: job.internalProjectEntityId,
			plugin: {
				...job.plugin,
				entrypoint
			},
			targets: job.targets,
			args: {
				detectorVersion: job.args.detectorVersion,
				parameters: job.args.parameters
			}
		};

		return worker.client.detect(query);
	}

	// eslint-disable-next-line class-methods-use-this
	private async receiveArtifacts(
		job: InternalJobEntity,
		artifacts: Buffer
	): Promise<DetectionResultSummary[]> {
		const summaries = await ProjectRepository.locateArtifacts(
			artifacts,
			job
		);
		if (summaries) {
			return summaries;
		}

		throw new Error(
			`invalid result format: ${job.internalHistoryEntityId}`
		);
	}

	public async exec(): Promise<void> {
		const job = await ExecutionService.findJob();

		if (!job) {
			return;
		}

		try {
			const artifacts = await this.sendQuery(job);
			if (artifacts === null) {
				// if there is no suitable worker for the plugin type
				return;
			}

			const summaries = await this.receiveArtifacts(job, artifacts);

			await ProjectRepository.setSucceeded(
				job.internalProjectEntityId,
				job.internalHistoryEntityId,
				summaries
			);
		} catch (err) {
			logger.warn(
				`failed to execute detect job ${job.internalJobEntityId.toHexString()}: ${JSON.stringify(
					err
				)}`
			);
			await ProjectRepository.setFailed(
				job.internalProjectEntityId,
				job.internalHistoryEntityId
			);
		} finally {
			await JobRepository.delete(job.internalJobEntityId);
		}
	}
}
