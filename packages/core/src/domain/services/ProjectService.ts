import Artifact from "common/all/types/Artifact";
import InternalProjectEntity from "common/server-only/types/InternalProjectEntity";
import InternalHistoryEntity from "common/server-only/types/InternalHistoryEntity";
import DirectoryEntry from "common/all/types/DirectoryEntry";

import ProjectNameError from "errors/ProjectNameError";
import HistoryError from "errors/HistoryError";
import ProjectRepository from "infrastructure/repositories/ProjectRepository";
import JobRepository from "infrastructure/repositories/JobRepository";
import GitProjectService from "domain/services/GitProjectService";

import logger from "utils/logger";
import {
	InternalUserEntityId,
	InternalProjectEntityId,
	InternalHistoryEntityId
} from "common/server-only/value-objects/EntityId";

export default class ProjectService {
	public static async findProjectsByOwnerId(
		ownerId: InternalUserEntityId
	): Promise<InternalProjectEntity[]> {
		return ProjectRepository.findProjectsByOwnerId(ownerId);
	}

	public static async findProjectByName(
		ownerId: InternalUserEntityId,
		projectName: string
	): Promise<InternalProjectEntity> {
		const project = await ProjectRepository.findProjectByName(
			ownerId,
			projectName
		);
		if (project) {
			return project;
		}

		throw ProjectNameError.projectNotFound(projectName);
	}

	public static async findHistory(
		ownerId: InternalUserEntityId,
		projectName: string,
		historyId: string
	): Promise<[InternalHistoryEntity, InternalProjectEntity]> {
		const project = await this.findProjectByName(ownerId, projectName);
		const history = project.histories.find(
			(value) => value.internalHistoryEntityId.toHexString() === historyId
		);

		if (history) {
			return [history, project];
		}

		throw HistoryError.historyNotFound(historyId);
	}

	public static async deleteHistory(
		ownerId: InternalUserEntityId,
		projectName: string,
		historyId: string
	): Promise<boolean> {
		const [history, project] = await this.findHistory(
			ownerId,
			projectName,
			historyId
		);
		if (history.status !== "Failed" && history.status !== "Succeeded") {
			if (!(await this.abortJob(ownerId, projectName, historyId))) {
				logger.warn(
					`Failed to abort the detection job for ${ownerId}/${projectName}/${historyId}. The history's will be deleted.`
				);
			}
		}

		return ProjectRepository.deleteHistory(
			project.internalProjectEntityId,
			history.internalHistoryEntityId
		);
	}

	public static async readArtifacts(
		ownerId: InternalUserEntityId,
		internalProjectEntityId: InternalProjectEntityId,
		internalHistoryEntityId: InternalHistoryEntityId
	): Promise<Artifact[]> {
		return ProjectRepository.readArtifacts(
			ownerId,
			internalProjectEntityId,
			internalHistoryEntityId
		);
	}

	public static async validateRevisionAndDirectory(
		ownerId: InternalUserEntityId,
		projectName: string,
		revision?: string,
		directory?: string
	): Promise<{
		directory?: string;
		revision?: string;
	}> {
		const project = await this.findProjectByName(ownerId, projectName);
		console.log(`${revision} ${directory}`);
		if (project) {
			try {
				const git = ProjectRepository.openGit(project);
				const r = await new GitProjectService(
					git
				).getCompleteCommitSHAOnDirectory({ revision, directory });
				return {};
			} catch (err) {
				if (err instanceof Error) {
					if (err.message.includes("revision")) {
						return {
							revision: err.message
						};
					}
					return {
						directory: err.message
					};
				}
				return {};
			}
		}
		return {};
	}

	public static async zipArtifacts(
		ownerId: InternalUserEntityId,
		projectName: string,
		historyId: string
	): Promise<string | null> {
		const [history, project] = await this.findHistory(
			ownerId,
			projectName,
			historyId
		);
		return ProjectRepository.zipArtifacts(
			ownerId,
			project.internalProjectEntityId,
			history.internalHistoryEntityId
		);
	}

	public static async loadEntry(
		ownerId: InternalUserEntityId,
		projectName: string,
		revision: string,
		path: string
	): Promise<string | DirectoryEntry[]> {
		const project = await this.findProjectByName(ownerId, projectName);
		const git = ProjectRepository.openGit(project);
		return new GitProjectService(git).loadEntry(revision, path);
	}

	public static async abortJob(
		ownerId: InternalUserEntityId,
		projectName: string,
		historyId: string
	): Promise<boolean> {
		const [history, project] = await this.findHistory(
			ownerId,
			projectName,
			historyId
		);

		if (history.status === "Succeeded") {
			return false;
		}

		const aborted = await JobRepository.abort(
			history.internalHistoryEntityId
		);
		if (!aborted) {
			logger.warn(
				`Failed to abort the detection job for ${ownerId}/${projectName}/${historyId}. The history's status will be changed to failed.`
			);
		}

		return ProjectRepository.setFailed(
			project.internalProjectEntityId,
			history.internalHistoryEntityId
		);
	}
}
