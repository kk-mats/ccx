import * as t from "io-ts";

import slugify from "slugify";

import DetectorVersion from "common/all/types/DetectorVersion";

import DetectorVersionError from "errors/DetectorVersionError";

export default function createDetectorVersion(
	value: string,
	queryField?: string
): DetectorVersion {
	const sluggified = slugify(value);

	if (sluggified !== value) {
		throw DetectorVersionError.invalidDetectorVersion(value, queryField);
	}

	return value as DetectorVersion;
}
