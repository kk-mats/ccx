import {
	AvailableDetectPlugins,
	DetectPluginConfig,
	PluginId
} from "common/all/types/plugin";
import { DetectPlugin } from "common/server-only/types/plugin";
import { InternalUserEntityId } from "common/server-only/value-objects/EntityId";

export interface PluginRepository {
	findDetectPlugin(id: string, owner: string): Promise<DetectPlugin | null>;

	detectPlugins(
		internalUserEntityId: InternalUserEntityId
	): Promise<AvailableDetectPlugins>;

	savePrivateDetectPlugin(
		internalUserEntityId: InternalUserEntityId,
		config: DetectPluginConfig
	): Promise<PluginId>;
}
