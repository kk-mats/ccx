import React from "react";

import {
	AvailableDetectPlugins,
	PluginId,
	PluginName
} from "common/all/types/plugin";
import { DetectionParameterDef } from "common/all/types/parameters";
import DetectorVersion from "common/all/types/DetectorVersion";

export type PrefixedPluginId = string & {
	_brand: "PrefixedPluginId";
};

export type DetectPluginEntity = {
	id: PluginId;
	name: PluginName;
	versions: DetectorVersion[];
	variants: {
		versions: DetectorVersion[];
		pKeys: string[];
		parameters: Record<string, DetectionParameterDef>;
	}[];
};

export type DetectPluginsEntity = {
	ids: PrefixedPluginId[];
	plugins: Record<string, DetectPluginEntity>;
};

type State = DetectPluginsEntity;

export const DetectPluginContext = React.createContext<State>({
	ids: [],
	plugins: {}
});

const normalize = (
	prefix: keyof AvailableDetectPlugins,
	plugins: AvailableDetectPlugins
): [PrefixedPluginId[], Record<string, DetectPluginEntity>] => {
	const ids: PrefixedPluginId[] = [];
	const record: Record<string, DetectPluginEntity> = {};

	plugins[prefix].forEach(({ id, name, variants }) => {
		const prefixedId = `${prefix}:${id}` as PrefixedPluginId;
		ids.push(prefixedId);
		record[prefixedId] = {
			id,
			name,
			versions: Array.from(
				new Set(variants.flatMap(({ versions }) => versions))
			).sort(),
			variants: variants.map(({ versions, parameters }) => ({
				versions,
				pKeys: Object.keys(parameters),
				parameters
			}))
		};
	});

	return [ids, record];
};

export const createInitialDetectPluginContext = (
	plugins: AvailableDetectPlugins
): State => {
	const [globalPluginIds, globalPlugins] = normalize("global", plugins);
	const [privatePluginIds, privatePlugins] = normalize("private", plugins);

	return {
		ids: [...globalPluginIds, ...privatePluginIds],
		plugins: {
			...globalPlugins,
			...privatePlugins
		}
	};
};
