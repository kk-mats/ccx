import * as path from "path";
import { SimpleGit as Git } from "simple-git/promise";

import DetectionTarget from "common/all/types/DetectionTarget";
import ProjectRelativePath from "common/all/types/ProjectRelativePath";
import GitCommitSHA from "common/all/types/GitCommitSHA";
import DirectoryEntry from "common/all/types/DirectoryEntry";
import DirectoryEntryName from "common/all/types/DirectoryEntryName";
import ProjectError from "errors/ProjectError";
import { RawTarget } from "common/all/types/detectRequest";

export default class GitProjectService {
	// eslint-disable-next-line no-useless-constructor
	constructor(private git: Git) {}

	public async getCompleteCommitSHA(revision: string): Promise<string> {
		const hash = await this.git.revparse([revision]);
		if (hash.startsWith("fatal:")) {
			throw new Error(`Invalid SHA: ${revision}`);
		}
		if (hash.split("\n").length !== 1) {
			throw new Error(`Not an unique SHA: ${revision}`);
		}

		return hash;
	}

	// returns complete commit hash
	public async getCompleteCommitSHAOnDirectory({
		directory,
		revision
	}: RawTarget): Promise<DetectionTarget> {
		if (directory === null || directory === undefined) {
			// eslint-disable-next-line no-param-reassign
			directory = ".";
		}

		if (typeof directory !== "string") {
			throw new Error(
				`Type of directory parameter is not string: ${directory}`
			);
		}

		if (revision === null || revision === undefined) {
			// eslint-disable-next-line no-param-reassign
			revision = "HEAD";
		}

		if (typeof revision !== "string") {
			throw new Error(
				`Type of revision parameter is not string: ${revision}`
			);
		}

		const normalizedPath = path.normalize(directory);

		if (!/^\w+$/.test(revision)) {
			throw new Error("Invalid SHA");
		}

		try {
			const completeHash = await this.getCompleteCommitSHA(revision);
			try {
				await this.git.show([completeHash, normalizedPath]);
				return {
					directory: normalizedPath as ProjectRelativePath,
					revision: completeHash as GitCommitSHA
				};
			} catch (err) {
				throw new Error(`Directory does not exist: ${directory}`);
			}
		} catch (err) {
			if (err instanceof Error && err.message.startsWith("Directory")) {
				throw err;
			}
			throw new Error(`Invalid revision: ${revision}`);
		}
	}

	public async loadEntry(
		revision: string,
		entryPath: string
	): Promise<string | DirectoryEntry[]> {
		const arg = `${revision}:${entryPath}`;
		try {
			const r = await this.git.show([arg]);
			if (r.startsWith(`tree ${arg}`)) {
				const entries: DirectoryEntry[] = r
					.split("\n")
					.map((entry) => entry.trim())
					.filter((entry) => entry)
					.slice(1)
					.map((entry) => {
						if (entry.endsWith("/")) {
							return {
								type: "directory",
								name: entry.slice(
									0,
									entry.length - 1
								) as DirectoryEntryName
							};
						}
						return {
							type: "file",
							name: entry as DirectoryEntryName
						};
					});
				return entries;
			}

			return r;
		} catch (err) {
			throw ProjectError.EntryNotFound(
				`revision: ${revision}, path: ${entryPath}`
			);
		}
	}
}
