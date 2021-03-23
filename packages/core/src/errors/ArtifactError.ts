import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";

export default class ArtifactError extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static artifactNotFound(
		queryValue: string,
		queryField?: string
	): ArtifactError {
		return new ArtifactError(
			Boom.internal(`Artifact not found`),
			queryValue,
			queryField
		);
	}
}
