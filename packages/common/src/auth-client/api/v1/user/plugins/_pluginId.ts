import * as t from "io-ts";
import { PluginId } from "../../../../../all/types/plugin";

export const route = (pluginId: PluginId): string => `plugins/${pluginId}`;
// DELETE /plugins/:pluginId
export const deleteResponse = t.type({});

export type DeleteResponse = t.TypeOf<typeof deleteResponse>;
