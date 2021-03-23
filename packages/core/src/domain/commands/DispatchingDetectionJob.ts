import {
	RawDetectRequest,
	DetectRequest,
	DetectRequestParameter,
	Target
} from "common/all/types/detectRequest";
import HistoryEntity from "common/all/types/HistoryEntity";

import ProjectNameError from "errors/ProjectNameError";

import ProjectRepository from "infrastructure/repositories/ProjectRepository";
import GitProjectService from "domain/services/GitProjectService";
import DetectorVersion from "common/all/types/DetectorVersion";
import { PluginRepository } from "domain/repository/PluginRepository";
import JobRepository from "infrastructure/repositories/JobRepository";
import InternalProjectEntity from "common/server-only/types/InternalProjectEntity";
import logger from "utils/logger";
import { createHistoryEntity } from "domain/factories/createInternalHistoryEntity";

import { DetectPluginVariant } from "common/all/types/plugin";
import { DetectPlugin } from "common/server-only/types/plugin";
import {
	InternalHistoryEntityId,
	InternalUserEntityId
} from "common/server-only/value-objects/EntityId";
import {
	DetectionParameterDef,
	DetectionParameters,
	DirectoryParameter,
	RevisionParameter
} from "common/all/types/parameters";

import {
	validateParameter,
	ValidationResult
} from "common/all/utils/validators";
import { pluginOwnerGlobal } from "infrastructure/repositories/PluginFileSystemRepository";

// git log --oneline -- src/repository
// error -> invalid directory
// else -> check commitSHA in hashes
export class DispatchingDetectionJob {
	private targets: Target[] = [];

	constructor(
		readonly user: InternalUserEntityId,
		readonly projectName: string,
		readonly request: RawDetectRequest,
		readonly pluginRepository: PluginRepository
	) {}

	private validateDirectory(
		service: GitProjectService
	): (
		directory: unknown,
		rule: DirectoryParameter["rule"],
		revision: unknown
	) => Promise<ValidationResult> {
		return async (directory, rule, revision): Promise<ValidationResult> => {
			const r: ValidationResult = {
				value: directory,
				valueLabel: directory,
				error: ""
			};
			if (typeof directory !== "string") {
				r.error = `directory parameter must be string: ${directory}`;
			} else {
				try {
					const target = await service.getCompleteCommitSHAOnDirectory(
						{
							directory,
							revision
						}
					);
					this.targets.push(target);
					r.valueLabel = target.directory;
				} catch (err) {
					r.error = JSON.stringify(err);
				}
			}
			return r;
		};
	}

	private static validateRevision(
		service: GitProjectService
	): (
		value: unknown,
		rule: RevisionParameter["rule"]
	) => Promise<ValidationResult> {
		return async (
			value: unknown,
			rule: RevisionParameter["rule"]
		): Promise<ValidationResult> => {
			const r: ValidationResult = {
				value,
				valueLabel: value,
				error: ""
			};

			if (typeof value !== "string") {
				r.error = `type of parameter must be string: ${value}`;
			} else {
				try {
					r.valueLabel = await service.getCompleteCommitSHA(value);
				} catch (err) {
					r.error = JSON.stringify(err);
				}
			}
			return r;
		};
	}

	private async validateParameters(
		project: InternalProjectEntity,
		defs: DetectPluginVariant["parameters"]
	): Promise<DetectRequestParameter[]> {
		const service = new GitProjectService(
			ProjectRepository.openGit(project)
		);

		return Promise.all(
			Object.entries(defs).map(async ([key, def]) => {
				const rs = await validateParameter(
					key,
					defs,
					this.request.args.parameters,
					this.validateDirectory(service),
					DispatchingDetectionJob.validateRevision(service)
				);

				if (Array.isArray(rs)) {
					return {
						label: def.label ?? key,
						value: rs.map(({ value }) => value),
						valueLabel: rs.map(({ valueLabel }) => valueLabel),
						description: def.description
					};
				}

				return {
					label: def.label ?? key,
					value: rs.value,
					valueLabel: rs.valueLabel,
					description: def.description
				};
			})
		);
	}

	private async findPlugin(): Promise<[DetectPlugin, DetectPluginVariant]> {
		const owner =
			this.request.plugin.owner === "private"
				? this.user.toHexString()
				: pluginOwnerGlobal;

		const plugin = await this.pluginRepository.findDetectPlugin(
			this.request.plugin.id,
			owner
		);

		if (!plugin) {
			throw new Error(
				`failed to find detect plugin: ID=${this.request.plugin.id}, Owner=${owner}`
			);
		}

		const variant = plugin.variants.find(({ versions }) =>
			(versions as string[]).includes(this.request.args.detectorVersion)
		);

		if (variant === undefined) {
			throw new Error(
				`Failed to find a detector variant: ID=${this.request.plugin.id}, version=${this.request.args.detectorVersion}`
			);
		}

		return [plugin, variant];
	}

	private async findProject(): Promise<InternalProjectEntity> {
		const project = await ProjectRepository.findProjectByName(
			this.user,
			this.projectName
		);
		if (!project) {
			throw ProjectNameError.projectNotFound(this.projectName);
		}

		return project;
	}

	private async dispatch(
		project: InternalProjectEntity,
		internalHistoryEntityId: InternalHistoryEntityId,
		plugin: DetectPlugin,
		validatedRequest: DetectRequest
	): Promise<void> {
		try {
			await JobRepository.dispatch(
				this.user,
				project.internalProjectEntityId,
				internalHistoryEntityId,
				plugin,
				validatedRequest.targets,
				{
					detectorVersion: validatedRequest.args.detectorVersion,
					parameters: this.request.args
						.parameters as DetectionParameters
				}
			);
		} catch (err) {
			if (
				await ProjectRepository.deleteHistory(
					project.internalProjectEntityId,
					internalHistoryEntityId
				)
			) {
				logger.error({
					"Recovery failed": {
						project: project.internalProjectEntityId,
						history: internalHistoryEntityId
					}
				});
			}

			throw err;
		}
	}

	public async exec(): Promise<HistoryEntity> {
		const [project, [plugin, variant]] = await Promise.all([
			this.findProject(),
			this.findPlugin()
		]);

		const validatedRequest: DetectRequest = {
			plugin: {
				id: plugin.id,
				name: plugin.name,
				owner: plugin.owner
			},
			targets: this.targets,
			args: {
				detectorVersion: this.request.args
					.detectorVersion as DetectorVersion,
				parameters: await this.validateParameters(
					project,
					variant.parameters
				)
			}
		};

		const history = await ProjectRepository.createHistory(
			project.internalProjectEntityId,
			validatedRequest
		);

		if (!history) {
			throw ProjectNameError.projectNotFound(project.name);
		}
		await this.dispatch(
			project,
			history.internalHistoryEntityId,
			plugin,
			validatedRequest
		);

		return createHistoryEntity(history, []);
	}
}
