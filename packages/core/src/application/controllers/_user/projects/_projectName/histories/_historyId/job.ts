import express from "express";

import useAsync from "common/server-only/middlewares/useAsync";
import ProjectService from "domain/services/ProjectService";
import { createEntityId } from "common/server-only/value-objects/EntityId";

import { Registry } from "types/registry";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	// for aborting the detection job
	router.delete<{
		userEntityId: string;
		projectName: string;
		historyId: string;
	}>(
		"*",
		useAsync(async (req, res) => {
			const { userEntityId, projectName, historyId } = req.params;
			const aborted = await ProjectService.abortJob(
				createEntityId(userEntityId),
				projectName,
				historyId
			);

			res.sendStatus(aborted ? 200 : 404);
		})
	);

	return router;
};

export default defineRoute;
