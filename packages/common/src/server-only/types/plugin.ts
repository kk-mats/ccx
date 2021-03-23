import * as t from "io-ts";
import { detectQueryPlugin } from "../codecs";

import {
	AnalyzePluginConfig,
	DetectPluginConfig,
	PluginId,
	PluginOwner
} from "../../all/types/plugin";

type ExtractCommonPart<
	L extends Record<string, unknown>,
	R extends Record<string, unknown>
> = {
	[K in keyof L & keyof R]: L[K] | R[K];
};

export type PluginConfig = ExtractCommonPart<
	DetectPluginConfig,
	AnalyzePluginConfig
>;

export type Plugin<I, C extends DetectPluginConfig> = C & {
	id: I;
	owner: PluginOwner;
};

export type DetectPlugin = Plugin<PluginId, DetectPluginConfig>;

export type DetectQueryPlugin = t.TypeOf<typeof detectQueryPlugin>;
