import * as fs from "fs";
import { readJSON, writeJSON } from "fs-extra";
import * as path from "path";
import * as stream from "stream";
import { MongoError } from "mongodb";
import * as mongoose from "mongoose";
import simplegit, { SimpleGit as Git } from "simple-git/promise";
import archiver from "archiver";

import InternalProjectEntity from "common/server-only/types/InternalProjectEntity";
import createInternalProjectEntity from "domain/factories/createInternalProjectEntity";

import ProjectNameError from "errors/ProjectNameError";
import ErrorOnProjectImporting from "errors/ErrorOnProjectImporting";

import ProjectName from "common/all/types/ProjectName";
import createGitURL from "domain/factories/createGitURL";
import InternalProjectSource from "common/server-only/types/InternalProjectSource";

import ProjectModel from "common/server-only/models/ProjectModel";
import createInternalHistoryEntity from "domain/factories/createInternalHistoryEntity";
import InternalHistoryEntity from "common/server-only/types/InternalHistoryEntity";
import JobStatus from "common/all/types/JobStatus";

import resolveChildrenPaths from "common/server-only/utils/resolveChildrenPaths";
import Artifact from "common/all/types/Artifact";
import logger from "utils/logger";
import ProjectCreated from "common/all/types/ProjectCreated";
import ProjectLastUpdated from "common/all/types/ProjectLastUpdated";
import DetectionResultSummary from "common/all/types/DetectionResultSummary";
import { DetectRequest } from "common/all/types/detectRequest";
import {
	InternalUserEntityId,
	InternalProjectEntityId,
	createEntityId,
	InternalHistoryEntityId
} from "common/server-only/value-objects/EntityId";
import * as tar from "tar-fs";
import { rawDetectionResult } from "domain/codecs";
import { createDetectionResult } from "domain/entity/RawDetectionResult";
import InternalJobEntity from "common/server-only/types/InternalJobEntity";
import DetectionResult from "common/all/types/DetectionResult";

export default class ProjectRepository {
	private static openGitOn(basePath: string): Git {
		return simplegit(basePath);
	}

	public static openGit(internalProjectEntity: InternalProjectEntity): Git {
		return this.openGitOn(
			resolveChildrenPaths(
				internalProjectEntity.ownerId,
				internalProjectEntity.internalProjectEntityId
			).repo
		);
	}

	public static async findProjectsByOwnerId(
		ownerId: InternalUserEntityId
	): Promise<InternalProjectEntity[]> {
		return (
			await ProjectModel.find({
				ownerId
			}).exec()
		).map((document) => createInternalProjectEntity(document));
	}

	public static async findProjectByName(
		ownerId: InternalUserEntityId,
		name: string
	): Promise<InternalProjectEntity | null> {
		const document = await ProjectModel.findOne({
			ownerId,
			name: name as ProjectName
		}).exec();

		return document && createInternalProjectEntity(document);
	}

	public static async createProject(
		ownerId: InternalUserEntityId,
		name: ProjectName,
		source: InternalProjectSource
	): Promise<InternalProjectEntity | null> {
		// created and lastUpdated are set automatically when the document is creating
		try {
			const document = await ProjectModel.create({
				ownerId,
				name,
				source: {
					gitURL: source.gitURL?.toString()
				},
				created: new Date() as ProjectCreated,
				lastUpdated: new Date() as ProjectLastUpdated,
				histories: []
			});

			const { repo, histories } = resolveChildrenPaths(
				ownerId,
				createEntityId(document._id)
			);
			try {
				await Promise.all([
					fs.promises.mkdir(repo, { recursive: true }),
					fs.promises.mkdir(histories, { recursive: true })
				]);

				await this.importCodes(source, repo);

				return createInternalProjectEntity(document);
			} catch (err) {
				await this.delete(ownerId, document._id);
			}
		} catch (err) {
			if (err instanceof MongoError) {
				if (err.code && err.code === 11000) {
					if (err.message.indexOf("name")) {
						throw ProjectNameError.unavailableProjectName(
							name,
							"name"
						);
					} else if (err.message.indexOf("gitURL") && source.gitURL) {
						throw ErrorOnProjectImporting.projectAlreadyExists(
							createGitURL(source.gitURL),
							"gitURL"
						);
					}
				}
			} else {
				throw err;
			}
		}

		return null;
	}

	private static async importCodes(
		source: InternalProjectSource,
		repoDir: string
	): Promise<void> {
		if (source.gitURL) {
			const git = this.openGitOn(repoDir);
			await git.clone(source.gitURL.toString(), repoDir);
			const branches = (await git.branch(["-r"])).all
				.filter(
					(branch) =>
						branch.startsWith("origin/") &&
						!branch.startsWith("origin/master")
				)
				.map((remote) => {
					return {
						remote,
						local: remote.substr("origin/".length)
					};
				});

			// eslint-disable-next-line no-restricted-syntax
			for await (const { local, remote } of branches) {
				await git.raw(["branch", "--track", local, remote]);
			}

			await git.raw(["fetch", "--all"]);
			await git.raw(["pull", "--all"]);
		}
	}

	public static async createHistory(
		internalProjectEntityId: InternalProjectEntityId,
		request: DetectRequest
	): Promise<InternalHistoryEntity | null> {
		const project = await ProjectModel.findOneAndUpdate(
			{ _id: internalProjectEntityId },
			{
				$push: {
					histories: {
						request,
						status: "Pending" as JobStatus,
						summaries: []
					} as any
				}
			},
			{ new: true }
		).exec();

		if (!project) {
			return null;
		}

		return createInternalHistoryEntity(
			project.histories[project.histories.length - 1]
		);
	}

	public static async deleteHistory(
		internalProjectEntityId: InternalProjectEntityId,
		internalHistoryEntityId: InternalHistoryEntityId
	): Promise<boolean> {
		return (
			(await ProjectModel.findOneAndUpdate(
				{ _id: internalProjectEntityId },
				{
					$pull: {
						histories: {
							_id: internalHistoryEntityId
						}
					}
				}
			)) !== null
		);
	}

	public static async delete(
		ownerId: InternalUserEntityId,
		projectEntityId: InternalProjectEntityId
	): Promise<void> {
		await ProjectModel.findByIdAndDelete(projectEntityId.toString()).exec();
	}

	private static async zip(source: string, dest: string): Promise<void> {
		const os = fs.createWriteStream(dest);
		const archive = archiver("zip");
		os.on("close", () => {
			logger.trace(`Finished to compress ${dest}`);
		});
		archive.on("warning", (err) => {
			logger.warn(err);
		});
		archive.on("error", (err) => {
			logger.error(err);
			throw err;
		});
		archive.pipe(os);
		archive.directory(source, false);
		await archive.finalize();
	}

	public static async zipArtifacts(
		ownerId: InternalUserEntityId,
		internalProjectEntityId: InternalProjectEntityId,
		internalHistoryEntityId: InternalHistoryEntityId
	): Promise<string | null> {
		const historyDir = path.resolve(
			resolveChildrenPaths(ownerId, internalProjectEntityId).histories,
			internalHistoryEntityId.toHexString()
		);

		const zipPath = `${historyDir}.zip`;

		try {
			if ((await fs.promises.stat(zipPath)).isFile()) {
				logger.trace(`Use cached file: ${zipPath}`);
				return zipPath;
			}
			await this.zip(historyDir, zipPath);
			return zipPath;
		} catch (err) {
			if ("code" in err && err.code === "ENOENT") {
				await this.zip(historyDir, zipPath);
				return zipPath;
			}
			throw err;
		}
	}

	public static async readArtifacts(
		ownerId: InternalUserEntityId,
		internalProjectEntityId: InternalProjectEntityId,
		internalHistoryEntityId: InternalHistoryEntityId
	): Promise<Artifact[]> {
		const historyDir = path.resolve(
			resolveChildrenPaths(ownerId, internalProjectEntityId).histories,
			internalHistoryEntityId.toHexString()
		);

		const readRecursive = async (parent: string): Promise<string[]> => {
			try {
				const entries = await fs.promises.readdir(parent, {
					withFileTypes: true
				});

				const artifacts = await Promise.all(
					entries.map(
						async (entry): Promise<string[]> => {
							const fullPath = `${parent}/${entry.name}`;
							if (entry.isFile()) {
								return [path.relative(historyDir, fullPath)];
							}
							return readRecursive(fullPath);
						}
					)
				);

				return artifacts.reduce(
					(previous, current) => previous.concat(current),
					[]
				);
			} catch (err) {
				if ("code" in err && err.code === "ENOENT") {
					return [];
				}

				throw err;
			}
		};

		return readRecursive(historyDir) as Promise<Artifact[]>;
	}

	private static async convertResult(
		historyPath: string,
		job: InternalJobEntity
	): Promise<DetectionResultSummary[]> {
		const dirs = await fs.promises.readdir(historyPath);
		const resultDirs = dirs.filter((dir) => /\d+/.exec(dir));

		const convertOne = async (
			dir: string
		): Promise<DetectionResultSummary> => {
			const clonesJsonPath = path.resolve(
				historyPath,
				dir,
				"clones.json"
			);
			const raw = await readJSON(clonesJsonPath);
			if (rawDetectionResult.is(raw)) {
				const result = createDetectionResult(raw, job.plugin, job.args);
				await writeJSON(clonesJsonPath, result);
				return {
					id: Number.parseInt(dir, 10),
					numberOfClonePairs: result.clonePairs.length,
					parameters: result.environment.parameters
				} as DetectionResultSummary;
			}
			throw Error(`Invalid format: ${clonesJsonPath}`);
		};

		return Promise.all(resultDirs.map(async (dir) => convertOne(dir)));
	}

	public static async readResult(
		ownerId: InternalUserEntityId,
		internalProjectEntityId: InternalProjectEntityId,
		internalHistoryEntityId: InternalHistoryEntityId,
		resultId: string
	): Promise<DetectionResult> {
		const { histories } = resolveChildrenPaths(
			ownerId,
			internalProjectEntityId
		);

		return (await readJSON(
			path.resolve(
				histories,
				internalHistoryEntityId.toHexString(),
				resultId,
				"clones.json"
			)
		)) as DetectionResult;
	}

	public static async locateArtifacts(
		artifacts: Buffer,
		job: InternalJobEntity
	): Promise<DetectionResultSummary[] | null> {
		const { histories } = resolveChildrenPaths(
			job.internalUserEntityId,
			job.internalProjectEntityId
		);
		const historyPath = path.resolve(
			histories,
			job.internalHistoryEntityId.toHexString()
		);

		const artifactsStream = new stream.Readable();
		artifactsStream.push(artifacts);
		artifactsStream.push(null);

		const loaded = await new Promise((resolve, rejected) => {
			const p = artifactsStream.pipe(tar.extract(historyPath));
			p.on("error", (err) => {
				rejected(err);
			});
			p.on("finish", () => {
				resolve(true);
			});
		});

		if (loaded) {
			return this.convertResult(historyPath, job);
		}
		return null;
	}

	public static async setRunning(
		internalProjectEntityId: InternalProjectEntityId,
		internalHistoryEntityId: InternalHistoryEntityId
	): Promise<boolean> {
		const project = await ProjectModel.findOneAndUpdate(
			{
				_id: internalProjectEntityId,
				"histories._id": internalHistoryEntityId
			},
			{
				$set: {
					"histories.$.status": "Running",
					"histories.$.started": Date.now()
				}
			}
		).exec();

		return project !== null;
	}

	public static async setFailed(
		internalProjectEntityId: InternalProjectEntityId,
		internalHistoryEntityId: InternalHistoryEntityId
	): Promise<boolean> {
		const project = await ProjectModel.findById(
			internalProjectEntityId
		).exec();

		if (!project) {
			return false;
		}
		const history = project.histories.id(
			(internalHistoryEntityId as unknown) as mongoose.Types.ObjectId
		);

		if (!history || history.status === "Succeeded") {
			return false;
		}

		return (
			(await ProjectModel.findOneAndUpdate(
				{
					_id: internalProjectEntityId,
					"histories._id": internalHistoryEntityId
				},
				{
					$set: {
						"histories.$.status": "Failed",
						"histories.$.finished": Date.now()
					}
				}
			).exec()) !== null
		);
	}

	public static async setSucceeded(
		internalProjectEntityId: InternalProjectEntityId,
		internalHistoryEntityId: InternalHistoryEntityId,
		summaries: DetectionResultSummary[]
	): Promise<boolean> {
		const project = await ProjectModel.findOneAndUpdate(
			{
				_id: internalProjectEntityId,
				"histories._id": internalHistoryEntityId
			},
			{
				$set: {
					"histories.$.status": "Succeeded",
					"histories.$.summaries": summaries,
					"histories.$.finished": Date.now()
				}
			}
		).exec();

		return project !== null;
	}
}
