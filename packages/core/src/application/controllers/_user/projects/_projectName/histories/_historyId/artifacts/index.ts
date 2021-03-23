import * as path from "path";
import * as fs from "fs";
import express from "express";

import useAsync from "common/server-only/middlewares/useAsync";
import ArtifactError from "errors/ArtifactError";
import ProjectService from "domain/services/ProjectService";
import logger from "utils/logger";
import { createEntityId } from "common/server-only/value-objects/EntityId";
import { fromError } from "common/all/types/Result";
import { Registry } from "types/registry";
import { file } from "common/all/codecs";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	// for fetching an artifact
	router.get<{
		userEntityId: string;
		projectName: string;
		historyId: string;
		filename: string;
	}>(
		"*",
		useAsync(async (req, res) => {
			const { userEntityId, projectName, historyId } = req.params;

			// Use `slice` to remove a forward slash in `req.url`
			const filepath = req.url.slice(1);

			if (filepath === `${historyId}.zip`) {
				const zipPath = await ProjectService.zipArtifacts(
					createEntityId(userEntityId),
					projectName,
					historyId
				);

				if (zipPath === null) {
					res.sendStatus(404);
				} else {
					res.sendFile(zipPath, (err) => {
						logger.trace(`Serve ${err}`);
					});
				}
				return;
			}

			const [history, project] = await ProjectService.findHistory(
				createEntityId(userEntityId),
				projectName,
				historyId
			);

			try {
				const p = path.resolve(
					"/ccx-store",
					"projects",
					userEntityId,
					project.internalProjectEntityId.toHexString(),
					"histories",
					history.internalHistoryEntityId.toHexString(),
					filepath
				);

				res.sendFile(p, (err) => {
					if (err !== undefined) {
						res.sendStatus(404);
					}
				});
			} catch (err) {
				if (err instanceof Error && err.message.startsWith("ENOENT:")) {
					res.status(404).send(
						fromError(ArtifactError.artifactNotFound(filepath))
					);
					return;
				}
				throw err;
			}
		})
	);

	return router;
};

export default defineRoute;
