import * as t from "io-ts";
import {
	availableDetectPlugins,
	detectPluginSchema,
	detectPluginVariant,
	plugin,
	pluginId,
	pluginName,
	pluginOwner,
	pluginEnvironment,
	mixedPluginEnvironment,
	analyzePluginConfig,
	detectPluginConfig
} from "../codecs";

export type Plugin = t.TypeOf<typeof plugin>;

export type PluginId = t.TypeOf<typeof pluginId>;

export type PluginName = t.TypeOf<typeof pluginName>;

export type PluginOwner = t.TypeOf<typeof pluginOwner>;

export type PluginEnvironment = t.TypeOf<typeof pluginEnvironment>;

export type MixedPluginEnvironment = t.TypeOf<typeof mixedPluginEnvironment>;

export type DetectPluginVariant = t.TypeOf<typeof detectPluginVariant>;

export type DetectPluginSchema = t.TypeOf<typeof detectPluginSchema>;

export type AvailableDetectPlugins = t.TypeOf<typeof availableDetectPlugins>;

export type DetectPluginConfig = t.TypeOf<typeof detectPluginConfig>;

export type AnalyzePluginConfig = t.TypeOf<typeof analyzePluginConfig>;
