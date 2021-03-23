import express from "express";
import { fromValue } from "common/all/types/Result";
import { createEntityId } from "common/server-only/value-objects/EntityId";
import { Registry } from "types/registry";
import useAsync from "common/server-only/middlewares/useAsync";
import { DeleteResponse } from "common/auth-client/api/v1/user/plugins/_pluginId";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	router.post<Record<"pluginId", string>, DeleteResponse>(
		"/",
		useAsync(async (req, res) => {
			const { pluginId } = req.params;
		})
	);

	return router;
};

export default defineRoute;
