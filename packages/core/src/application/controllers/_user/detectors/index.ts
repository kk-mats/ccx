import express from "express";
import { fromValue } from "common/all/types/Result";
import { createEntityId } from "common/server-only/value-objects/EntityId";
import { Registry } from "types/registry";
import useAsync from "common/server-only/middlewares/useAsync";
import { GetResponse } from "common/auth-client/api/v1/detectors";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	router.get<{ userEntityId: string }, GetResponse>(
		"/",
		useAsync(async (req, res) => {
			const plugins = await registry.pluginRepository.detectPlugins(
				createEntityId(req.params.userEntityId)
			);

			res.send(fromValue(plugins));
		})
	);
	return router;
};

export default defineRoute;
