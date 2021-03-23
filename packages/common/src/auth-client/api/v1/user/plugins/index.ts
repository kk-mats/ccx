import * as t from "io-ts";
import { pluginId, availableDetectPlugins } from "../../../../../all/codecs";
import Result from "../../../../../all/types/Result";

export const route = "plugins";

// GET /plugins
export const getResponse = t.type({
	detect: availableDetectPlugins
});

export type GetResponse = t.TypeOf<typeof getResponse>;

// POST /plugins
const postRequest = t.unknown;

export type PostRequest = t.TypeOf<typeof postRequest>;

const postResponse = t.type({
	id: pluginId
});

export type PostResponse = Result<t.TypeOf<typeof postResponse>>;
