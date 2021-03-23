import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";
import GitURL from "common/all/types/GitURL";

const unsupportedGitURLProtocolErrorMessage = "Unsupported Git Url Protocol";
const couldNotExtractProjectNameFromGitURLErrorMessage =
	"Could not extract project name from Git URL";

export default class ErrorOnProjectImporting extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static unsupportedGitURLProtocol(
		queryValue: string,
		queryField?: string
	): ErrorOnProjectImporting {
		return new ErrorOnProjectImporting(
			Boom.badRequest(unsupportedGitURLProtocolErrorMessage),
			queryValue,
			queryField
		);
	}

	public static couldNotExtractProjectNameFromGitURL(
		queryValue: GitURL,
		queryField?: string
	): ErrorOnProjectImporting {
		return new ErrorOnProjectImporting(
			Boom.badRequest(couldNotExtractProjectNameFromGitURLErrorMessage),
			queryValue.toString(),
			queryField
		);
	}

	public static projectAlreadyExists(
		queryValue: GitURL,
		queryField?: string
	): ErrorOnProjectImporting {
		return new ErrorOnProjectImporting(
			Boom.conflict("Project already exists"),
			queryValue.toString(),
			queryField
		);
	}
}
