import * as t from "io-ts";
import * as mongoose from "mongoose";
import {
	brand,
	url,
	projectEntityProps,
	historyEntityProps,
	detectorVersion,
	parameterDef,
	abstractPluginConfig,
	abstractDetectPluginConfig,
	pluginEnvironmentCommand,
	pluginEnvironmentDockerfile,
	pluginEnvironmentImage,
	pluginOwner,
	abstractMixedPluginEnvironment,
	detectionParameters,
	pluginId,
	pluginName,
	detectionTarget
} from "../all/codecs";

export type InternalEntityId = {
	toHexString: () => string;
};

const isValidInternalEntityId = (input: unknown): input is InternalEntityId => {
	return input instanceof mongoose.Types.ObjectId;
};

export const internalEntityId = new t.Type<
	InternalEntityId,
	InternalEntityId,
	unknown
>(
	"EntityId",
	isValidInternalEntityId,
	(input, context) =>
		isValidInternalEntityId(input)
			? t.success(input)
			: t.failure(input, context),
	t.identity
);

export const internalProjectEntityId = brand(
	internalEntityId,
	"InternalProjectEntityId"
);
export const internalUserEntityId = brand(
	internalEntityId,
	"InternalUserEntityId"
);

export const internalHistoryEntityId = brand(
	internalEntityId,
	"InternalHistoryEntityId"
);

export const internalJobEntityId = brand(
	internalEntityId,
	"InternalJobEntityId"
);

export const gitURLWithPassword = brand(url, "GitURLWithPassword");

export const internalProjectSource = t.partial({
	gitURL: gitURLWithPassword
});

export const internalHistoryEntity = t.intersection([
	t.type({
		...historyEntityProps.essentials,
		internalHistoryEntityId
	}),
	t.partial({
		...historyEntityProps.optionals
	})
]);

export const internalProjectEntity = t.type({
	...projectEntityProps,
	internalProjectEntityId,
	ownerId: internalUserEntityId,
	source: internalProjectSource,
	histories: t.array(internalHistoryEntity)
});

export const queryId = brand(t.string, "QueryID");

export const detectQueryPlugin = t.type({
	id: pluginId,
	name: pluginName,
	owner: pluginOwner,
	environment: abstractMixedPluginEnvironment({
		command: pluginEnvironmentCommand,
		dockerfile: pluginEnvironmentDockerfile,
		image: pluginEnvironmentImage
	})
});

export const detectionJob = t.intersection([
	t.type({
		internalJobEntityId,
		internalUserEntityId,
		internalProjectEntityId,
		internalHistoryEntityId,
		targets: t.array(detectionTarget),
		plugin: detectQueryPlugin,
		args: t.type({
			detectorVersion,
			parameters: detectionParameters
		})
	}),
	t.partial({
		workerBaseUrl: t.string
	})
]);

export const internalJobEntity = detectionJob;
