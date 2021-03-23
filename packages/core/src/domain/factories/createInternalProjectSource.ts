import * as t from "io-ts";

import ProjectSource from "common/all/types/ProjectSource";

import InternalProjectSource from "common/server-only/types/InternalProjectSource";
import createGitURLWithPassword from "domain/factories/createGitURLWithPassword";
import createGitURL from "domain/factories/createGitURL";

export type RawProjectSource = {
	gitURL?: string;
};

export default function createInternalProjectSource(
	source: RawProjectSource
): InternalProjectSource {
	if (source.gitURL) {
		return {
			gitURL: createGitURLWithPassword(source.gitURL)
		};
	}

	return {};
}

export function createProjectSource(
	source: InternalProjectSource
): ProjectSource {
	return {
		gitURL: source.gitURL && createGitURL(source.gitURL)
	};
}
