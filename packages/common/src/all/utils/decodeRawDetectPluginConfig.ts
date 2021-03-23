import * as t from "io-ts";
import { formatValidationErrors } from "io-ts-reporters";
import { isRight } from "fp-ts/Either";

import { constUndefined } from "fp-ts/lib/function";
import { rawDetectPluginConfig } from "../codecs";
import { MixedPluginEnvironment, PluginEnvironment } from "../types/plugin";
import { PluginConfig } from "../../server-only/types/plugin";

// Raw parameter definitions for validating detect plugin config objects

export type RawDetectPluginConfig = t.TypeOf<typeof rawDetectPluginConfig>;

type RawDetectPluginConfigDecodingResult =
	| {
			value: RawDetectPluginConfig;
	  }
	| {
			value?: undefined;
			report: string[];
	  };

export const decodeRawDetectPluginConfig = (
	o: unknown
): RawDetectPluginConfigDecodingResult => {
	const result = rawDetectPluginConfig.decode(o);
	if (isRight(result)) {
		return {
			value: result.right
		};
	}
	return {
		report: formatValidationErrors(result.left, {
			truncateLongTypes: false
		})
	};
};

const environmentError = (
	os: keyof MixedPluginEnvironment,
	property: keyof PluginEnvironment
) =>
	`environment.${os}.${property} is not supported for uploaded plugins. Only environment.${os}.image is allowed.`;

const checkUploadedPluginEnvironment = (
	os: keyof MixedPluginEnvironment,
	environment: PluginEnvironment
): string[] => {
	const errors: string[] = [];

	if ("command" in environment) {
		errors.push(environmentError(os, "command"));
	}

	if ("dockerfile" in environment) {
		errors.push(environmentError(os, "dockerfile"));
	}

	return errors;
};

export const checkUploadedPluginConfig = (config: PluginConfig): string[] => {
	const errors: string[] = [];

	if (config.environment.windows) {
		const winEnv = checkUploadedPluginEnvironment(
			"windows",
			config.environment.windows
		);
		errors.push(...winEnv);
	}

	if (config.environment.linux) {
		const linuxEnv = checkUploadedPluginEnvironment(
			"linux",
			config.environment.linux
		);
		errors.push(...linuxEnv);
	}

	return [];
};
