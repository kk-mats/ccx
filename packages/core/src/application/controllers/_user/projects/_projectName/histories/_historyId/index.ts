import express from "express";

import useAsync from "common/server-only/middlewares/useAsync";

import { GetResponse } from "common/auth-client/api/v1/projects/_projectName/histories/_historyId";

import ProjectService from "domain/services/ProjectService";
import createHistoryEntityForClient from "domain/factories/createHistoryEntityForClient";

import artifacts from "application/controllers/_user/projects/_projectName/histories/_historyId/artifacts";
import result from "application/controllers/_user/projects/_projectName/histories/_historyId/result";
import job from "application/controllers/_user/projects/_projectName/histories/_historyId/job";
import { createEntityId } from "common/server-only/value-objects/EntityId";
import { fromValue } from "common/all/types/Result";
import { Registry } from "types/registry";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	router.use("/artifacts", artifacts(registry));
	router.use("/result", result(registry));
	router.use("/job", job(registry));

	// for fetching history
	router.get<
		{ userEntityId: string; projectName: string; historyId: string },
		GetResponse
	>(
		"/",
		useAsync(async (req, res) => {
			const { userEntityId, projectName, historyId } = req.params;
			const [history, project] = await ProjectService.findHistory(
				createEntityId(userEntityId),
				projectName,
				historyId
			);
			res.send(
				fromValue(
					createHistoryEntityForClient(
						history,
						await ProjectService.readArtifacts(
							project.ownerId,
							project.internalProjectEntityId,
							history.internalHistoryEntityId
						)
					)
				)
			);
		})
	);

	router.delete<{
		userEntityId: string;
		projectName: string;
		historyId: string;
	}>(
		"/",
		useAsync(async (req, res) => {
			const { userEntityId, projectName, historyId } = req.params;
			const deleted = await ProjectService.deleteHistory(
				createEntityId(userEntityId),
				projectName,
				historyId
			);
			res.sendStatus(deleted ? 200 : 404);
		})
	);
	return router;
};

export default defineRoute;
