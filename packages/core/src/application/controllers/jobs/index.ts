import express from "express";
import { fromValue } from "common/all/types/Result";
import { createEntityId } from "common/server-only/value-objects/EntityId";
import { Registry } from "types/registry";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	router.get<{ userEntityId: string }>("/", (req, res) => {
		registry.pluginRepository
			.detectPlugins(createEntityId(req.params.userEntityId))
			.then((value) => {
				res.send(fromValue(value));
			})
			.catch((err) => {
				throw err;
			});
	});
	return router;
};

export default defineRoute;
