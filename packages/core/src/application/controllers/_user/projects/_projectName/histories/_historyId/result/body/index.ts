import express from "express";

import useAsync from "common/server-only/middlewares/useAsync";

import normalizeDetectionResultBody from "common/all/utils/normalizeDetectionResultBody";
import { GetResponse } from "common/auth-client/api/v1/projects/_projectName/histories/_historyId/result/body";

import ArtifactError from "errors/ArtifactError";
import ProjectService from "domain/services/ProjectService";
import {
	createEntityId,
	InternalHistoryEntityId
} from "common/server-only/value-objects/EntityId";
import { fromValue } from "common/all/types/Result";
import { Registry } from "types/registry";
import ProjectRepository from "infrastructure/repositories/ProjectRepository";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	// for fetching normalized detection result body
	router.get<
		{
			userEntityId: string;
			projectName: string;
			historyId: string;
			resultId: string;
		},
		GetResponse
	>(
		"/",
		useAsync(async (req, res) => {
			const {
				userEntityId,
				projectName,
				historyId,
				resultId
			} = req.params;
			const internalHistoryEntityId = createEntityId(
				historyId
			) as InternalHistoryEntityId;

			const project = await ProjectService.findProjectByName(
				createEntityId(userEntityId),
				projectName
			);

			try {
				const result = await ProjectRepository.readResult(
					project.ownerId,
					project.internalProjectEntityId,
					internalHistoryEntityId,
					resultId
				);

				res.send(fromValue(normalizeDetectionResultBody(result)));
			} catch (err) {
				throw ArtifactError.artifactNotFound("clones.json");
			}
		})
	);

	return router;
};

export default defineRoute;
