import express from "express";

import {
	postRequest,
	PostRequest,
	PostResponse
} from "common/auth-client/api/v1/projects/_projectName/histories";
import useAsync from "common/server-only/middlewares/useAsync";
import validateRequest from "common/server-only/middlewares/validateRequest";
import historyId from "application/controllers/_user/projects/_projectName/histories/_historyId";

import createHistoryEntityForClient from "domain/factories/createHistoryEntityForClient";
import ProjectService from "domain/services/ProjectService";
import { DispatchingDetectionJob } from "domain/commands/DispatchingDetectionJob";
import { createEntityId } from "common/server-only/value-objects/EntityId";
import { fromValue } from "common/all/types/Result";

import { Registry } from "types/registry";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	// for fetching histories
	router.get<{ userEntityId: string; projectName: string }>(
		"/",
		useAsync(async (req, res) => {
			const { userEntityId, projectName } = req.params;
			const internalProjectEntity = await ProjectService.findProjectByName(
				createEntityId(userEntityId),
				projectName
			);
			const histories = await Promise.all(
				internalProjectEntity.histories.map(async (history) => {
					return createHistoryEntityForClient(
						history,
						await ProjectService.readArtifacts(
							internalProjectEntity.ownerId,
							internalProjectEntity.internalProjectEntityId,
							history.internalHistoryEntityId
						)
					);
				})
			);

			res.send(
				fromValue({
					histories
				})
			);
		})
	);

	// for dispatching a new detection job
	router.post<
		{ userEntityId: string; projectName: string },
		PostResponse,
		PostRequest
	>(
		"/",
		validateRequest(postRequest),
		useAsync(async (req, res) => {
			const history = await new DispatchingDetectionJob(
				createEntityId(req.params.userEntityId),
				req.params.projectName,
				req.body,
				registry.pluginRepository
			).exec();

			res.send(
				fromValue({
					historyId: history.historyId
				})
			);
		})
	);

	router.use("/:historyId", historyId(registry));

	return router;
};

export default defineRoute;
