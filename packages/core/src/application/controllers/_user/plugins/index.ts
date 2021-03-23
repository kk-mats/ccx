import express from "express";
import multer from "multer";
import { fromError, fromValue } from "common/all/types/Result";
import { createEntityId } from "common/server-only/value-objects/EntityId";
import { Registry } from "types/registry";
import useAsync from "common/server-only/middlewares/useAsync";
import {
	GetResponse,
	PostRequest,
	PostResponse
} from "common/auth-client/api/v1/user/plugins";
import pluginId from "application/controllers/_user/plugins/_pluginId";
import yaml from "js-yaml";
import {
	checkUploadedPluginConfig,
	decodeRawDetectPluginConfig
} from "common/all/utils/decodeRawDetectPluginConfig";
import { DetectPluginConfig } from "common/all/types/plugin";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	router.use("/:pluginId", pluginId);

	router.get<{ userEntityId: string }, GetResponse>(
		"/",
		useAsync(async (req, res) => {
			const detect = await registry.pluginRepository.detectPlugins(
				createEntityId(req.params.userEntityId)
			);

			res.send(fromValue({ detect }));
		})
	);

	const upload = multer({
		dest: registry.temporaryStoreRepository.pluginsRoot()
	});

	router.post<{ userEntityId: string }, PostResponse, PostRequest>(
		"/",
		useAsync(async (req, res) => {
			const pluginConfigJson = req.body;

			const result = decodeRawDetectPluginConfig(pluginConfigJson);
			if (result.value) {
				const config = (result.value as unknown) as DetectPluginConfig;
				const errors = checkUploadedPluginConfig(config);
				if (errors.length > 0) {
					res.status(401).send({
						error: {
							status: "Bad Request",
							statusCode: 401,
							query: {},
							message: JSON.stringify(errors)
						}
					});
				} else {
					res.send({
						id: await registry.pluginRepository.savePrivateDetectPlugin(
							createEntityId(req.params.userEntityId),
							config
						)
					});
				}
			} else {
				res.status(401).send({
					error: {
						status: "Bad Request",
						statusCode: 401,
						query: {},
						message: JSON.stringify(result.report)
					}
				});
			}
		})
	);
	return router;
};

export default defineRoute;
