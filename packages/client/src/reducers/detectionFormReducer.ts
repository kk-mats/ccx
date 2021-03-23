import DetectorVersion from "common/all/types/DetectorVersion";
import { DetectionParameterDef } from "common/all/types/parameters";
import {
	validateFloatParameter,
	validateInputParameter,
	validateIntParameter,
	validateSwitchParameter
} from "common/all/utils/validators";
import {
	DetectPluginEntity,
	DetectPluginsEntity,
	PrefixedPluginId
} from "contexts/DetectPluginContext";

import { ValidateRepositoryPath } from "utils/validateRepositoryPath";

export type Config = {
	variant: DetectPluginEntity["variants"][number];
	formValues: {
		pluginId: PrefixedPluginId;
		parameters: Record<string, unknown>;
		detectorVersion: DetectorVersion;
	};
	formState: {
		errors: Record<string, string | (string | undefined)[] | undefined>;
		disabled: boolean;
		validatingKeys: Set<string>;
		validateRepositoryPath: ValidateRepositoryPath;
	};
};

export type State = Config;

type ActionType<
	Type extends string,
	Payload extends Record<string, unknown> | undefined
> = Payload extends undefined
	? {
			type: Type;
	  }
	: {
			type: Type;
			payload: Payload;
	  };

export type Action =
	| ActionType<
			"change-detector",
			{
				id: PrefixedPluginId;
			}
	  >
	| ActionType<
			"change-version",
			{
				version: DetectorVersion;
			}
	  >
	| ActionType<
			"set-parameter",
			{
				key: string;
				value: unknown;
			}
	  >
	| ActionType<
			"start-async-validation",
			{
				key: string;
				value: unknown;
			}
	  >
	| ActionType<
			"finish-async-validation",
			{
				key: string;
				error?: string | undefined;
			}
	  >;

const checkConfigDisabled = (
	errors: Config["formState"]["errors"],
	validatingKeys: Config["formState"]["validatingKeys"]
): boolean =>
	validatingKeys.size > 0 ||
	Object.values(errors).some((error) =>
		Array.isArray(error)
			? error.some((e) => e !== undefined)
			: error !== undefined
	);

const validatePure = (
	key: string,
	def: DetectionParameterDef,
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>
): string | undefined | (string | undefined)[] => {
	switch (def.type) {
		case "int": {
			const r = validateIntParameter(values[key], def.rule, defs, values);
			return Array.isArray(r) ? r.map(({ error }) => error) : r.error;
		}

		case "float": {
			const r = validateFloatParameter(
				values[key],
				def.rule,
				defs,
				values
			);
			return Array.isArray(r) ? r.map(({ error }) => error) : r.error;
		}

		case "input": {
			const r = validateInputParameter(
				values[key],
				def.rule,
				defs,
				values
			);
			return Array.isArray(r) ? r.map(({ error }) => error) : r.error;
		}

		case "switch": {
			if (values[key] && def.rule.exclusive) {
				const exDef = defs[def.rule.exclusive];
				const exValue = values[def.rule.exclusive];
				if (
					(exDef.type === "switch" && exValue) ||
					(exDef.type === "optional" && exValue !== null)
				) {
					return `Parameters ${def.label ?? key} and ${
						defs[def.rule.exclusive].label ?? def.rule.exclusive
					} cannot be set simultaneously.`;
				}
			}
		}
	}

	return undefined;
};

export const validateAll = (
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>
): Record<string, string | undefined | (string | undefined)[]> => {
	const r: Record<string, string | undefined | (string | undefined)[]> = {};

	Object.entries(defs).forEach(([key, def]) => {
		if (def.type === "optional") {
			if (def.rule.type !== "directory") {
				r[key] = validatePure(key, def, defs, values);
			} else {
				r[key] = undefined;
			}
			if (values[key] && def.rule.exclusive) {
				const exDef = defs[def.rule.exclusive];
				const exValue = values[def.rule.exclusive];
				if (
					(exDef.type === "switch" && exValue) ||
					(exDef.type === "optional" && exValue !== null)
				) {
					r[key] = `Parameters ${def.label ?? key} and ${
						defs[def.rule.exclusive].label ?? def.rule.exclusive
					} cannot be set simultaneously.`;
				} else {
					r[key] = undefined;
				}
			} else {
				r[key] = undefined;
			}
		} else if (def.type !== "directory" && def.type !== "revision") {
			r[key] = validatePure(key, def, defs, values);
		} else {
			r[key] = undefined;
		}
	});

	return r;
};

const createConfigByPluginIdAndVersion = (
	pluginId: PrefixedPluginId,
	detectorVersion: DetectorVersion,
	variant: DetectPluginEntity["variants"][number],
	validateRepositoryPath: ValidateRepositoryPath
): Config => {
	const validatingKeys = new Set<string>();
	const parameters: Config["formValues"]["parameters"] = {};

	variant.pKeys.forEach((pKey) => {
		const { type, rule } = variant.parameters[pKey];
		if (rule !== undefined && "multiple" in rule && rule.multiple) {
			parameters[pKey] =
				rule?.default !== undefined ? [rule?.default] : [];
		} else if (rule !== undefined && "default" in rule) {
			parameters[pKey] = rule?.default;
		} else if (type === "directory") {
			parameters[pKey] = ".";
		} else if (type === "revision") {
			parameters[pKey] = "HEAD";
		}
	});
	const errors = validateAll(variant.parameters, parameters);

	return {
		variant,
		formValues: {
			pluginId,
			detectorVersion,
			parameters
		},
		formState: {
			errors,
			validatingKeys,
			validateRepositoryPath,
			disabled: checkConfigDisabled(errors, validatingKeys)
		}
	};
};

const createConfigByPluginId = (
	pluginId: PrefixedPluginId,
	plugins: Record<string, DetectPluginEntity>,
	validateRepositoryPath: ValidateRepositoryPath
): Config =>
	createConfigByPluginIdAndVersion(
		pluginId,
		plugins[pluginId].variants[0].versions[0],
		plugins[pluginId].variants[0],
		validateRepositoryPath
	);

export const getInitialState = ({
	entity,
	validateRepositoryPath
}: {
	entity: DetectPluginsEntity;
	validateRepositoryPath: ValidateRepositoryPath;
}): State => {
	return createConfigByPluginId(
		entity.ids[0],
		entity.plugins,
		validateRepositoryPath
	);
};

export const reducer = (
	entity: DetectPluginsEntity,
	validateRepositoryPath: ValidateRepositoryPath
) => {
	// eslint-disable-next-line consistent-return
	return (state: State, action: Action): State => {
		console.log(action);

		const next = { ...state };
		switch (action.type) {
			case "change-detector": {
				return createConfigByPluginId(
					action.payload.id,
					entity.plugins,
					validateRepositoryPath
				);
			}

			case "change-version": {
				return createConfigByPluginIdAndVersion(
					state.formValues.pluginId,
					action.payload.version,
					state.variant,
					validateRepositoryPath
				);
			}

			case "set-parameter": {
				const { key, value } = action.payload;
				next.formValues.parameters[key] = value;
				next.formState.errors = validateAll(
					next.variant.parameters,
					next.formValues.parameters
				);
				break;
			}

			case "start-async-validation": {
				const { key, value } = action.payload;
				next.formValues.parameters[key] = value;
				next.formState.validatingKeys.add(key);
				break;
			}

			case "finish-async-validation": {
				const { key, error } = action.payload;

				next.formState.validatingKeys.delete(key);
				next.formState.errors[key] = error;
			}
		}

		next.formState.disabled = checkConfigDisabled(
			next.formState.errors,
			next.formState.validatingKeys
		);

		return next;
	};
};
