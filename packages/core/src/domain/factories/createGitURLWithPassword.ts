import { URL } from "url";

import GitURLWithPassword from "domain/value-objects/GitURLWithPassword";

import { supportedGitURLProtocols } from "common/all/constants/limitations/gitURL";

import GitURLError from "errors/GitURLError";

export default function createGitURLWithPassword(
	value: string,
	queryField?: string
): GitURLWithPassword {
	try {
		const parsed = new URL(value);
		if (parsed.protocol in supportedGitURLProtocols) {
			throw GitURLError.unsupportedGitProtocol(value, queryField);
		}

		return parsed as GitURLWithPassword;
	} catch (err) {
		if (err instanceof TypeError) {
			throw GitURLError.invalidGitURL(value, queryField);
		}

		throw err;
	}
}
