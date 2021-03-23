import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";

const invalidDetectorVersionErrorMessage =
	"Detector version contains invalid character";

export default class DetectorVersionError extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static invalidDetectorVersion(
		queryValue: string,
		queryField?: string
	): DetectorVersionError {
		return new DetectorVersionError(
			Boom.badRequest(invalidDetectorVersionErrorMessage),
			queryValue,
			queryField
		);
	}

	public static detectorVersionNotFound(
		queryValue: string,
		queryField?: string
	): DetectorVersionError {
		return new DetectorVersionError(
			Boom.internal(`Detector version not found`),
			queryValue,
			queryField
		);
	}
}
