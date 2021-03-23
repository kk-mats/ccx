import { extractNameFromGitURL } from "common/all/constants/regex";
import ProjectEntity from "common/all/types/ProjectEntity";
import { createProjectEntity } from "domain/factories/createInternalProjectEntity";

import GitURLWithPassword from "domain/value-objects/GitURLWithPassword";
import createGitURLWithPassword from "domain/factories/createGitURLWithPassword";
import ProjectName from "common/all/types/ProjectName";
import createProjectName from "domain/factories/createProjectName";
import createGitURL from "domain/factories/createGitURL";

import ErrorOnProjectImporting from "errors/ErrorOnProjectImporting";
import ProjectRepository from "infrastructure/repositories/ProjectRepository";
import { InternalUserEntityId } from "common/server-only/value-objects/EntityId";

export default class ImportingProjectByGitURL {
	readonly gitURL: GitURLWithPassword;

	readonly name: ProjectName;

	constructor(readonly ownerId: InternalUserEntityId, gitURL: string) {
		this.gitURL = createGitURLWithPassword(gitURL, "gitURL");

		const match = this.gitURL.pathname.match(extractNameFromGitURL);
		if (match && match[1]) {
			this.name = createProjectName(match[1]);
			return;
		}

		throw ErrorOnProjectImporting.couldNotExtractProjectNameFromGitURL(
			createGitURL(this.gitURL),
			"gitURL"
		);
	}

	public async exec(): Promise<ProjectEntity | null> {
		const r = await ProjectRepository.createProject(
			this.ownerId,
			this.name,
			{
				gitURL: this.gitURL
			}
		);
		if (r !== null) {
			return createProjectEntity(r);
		}
		return null;
	}
}
