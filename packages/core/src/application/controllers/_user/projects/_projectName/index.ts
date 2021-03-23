import express from "express";

import useAsync from "common/server-only/middlewares/useAsync";
import * as _projectName from "common/auth-client/api/v1/projects/_projectName";

import histories from "application/controllers/_user/projects/_projectName/histories";
import revision from "application/controllers/_user/projects/_projectName/revisions/_revision";
import ProjectService from "domain/services/ProjectService";
import { createProjectEntity } from "domain/factories/createInternalProjectEntity";

import { GetResponse } from "common/auth-client/api/v1/projects/_projectName/check";
import compare from "application/controllers/_user/projects/_projectName/compare";
import { Registry } from "types/registry";
import { createEntityId } from "common/server-only/value-objects/EntityId";
import { fromValue } from "common/all/types/Result";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	// for checking directory path and revision
	router.post<
		{ userEntityId: string; projectName: string },
		{ directory?: string; revision?: string },
		GetResponse
	>(
		"/check",
		useAsync(async (req, res) => {
			const { userEntityId, projectName } = req.params;
			res.send(
				await ProjectService.validateRevisionAndDirectory(
					createEntityId(userEntityId),
					projectName,
					req.body.revision,
					req.body.directory
				)
			);
		})
	);

	router.use("/compare", compare(registry));

	router.use("/histories", histories(registry));
	router.use("/revisions/:revision", revision(registry));

	// for fetching a project
	router.get<
		{ userEntityId: string; projectName: string },
		_projectName.GetResponse
	>(
		"/",
		useAsync(async (req, res) => {
			const { userEntityId, projectName } = req.params;
			const internalProjectEntity = await ProjectService.findProjectByName(
				createEntityId(userEntityId),
				projectName
			);

			res.send(fromValue(createProjectEntity(internalProjectEntity)));
		})
	);

	return router;
};

export default defineRoute;
