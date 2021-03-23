import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";

const invalidDetectorIdErrorMessage =
	"Only alphanumric characters, unserscores, hypens are allowed in detector ID";

export default class DetectorIdError extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static invalidDetectorId(
		queryValue: string,
		queryField?: string
	): DetectorIdError {
		return new DetectorIdError(
			Boom.badRequest(invalidDetectorIdErrorMessage),
			queryValue,
			queryField
		);
	}

	public static detectorIdNotFound(
		queryValue: string,
		queryField?: string
	): DetectorIdError {
		return new DetectorIdError(
			Boom.notFound(`Detector ID not found`),
			queryValue,
			queryField
		);
	}

	public static detectorServerNotFound(
		queryValue: string,
		queryField?: string
	): DetectorIdError {
		return new DetectorIdError(
			Boom.internal(`Detector server not found`),
			queryValue,
			queryField
		);
	}
}
