import * as express from "express";
import useAsync from "common/server-only/middlewares/useAsync";
import { GetResponse } from "common/auth-client/api/v1/projects/_projectName/_revision";
import ProjectService from "domain/services/ProjectService";
import { createEntityId } from "common/server-only/value-objects/EntityId";
import { fromValue } from "common/all/types/Result";

import { Registry } from "types/registry";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	router.get<
		{
			userEntityId: string;
			projectName: string;
			revision: string;
			path: string;
		},
		GetResponse,
		unknown,
		{
			s?: string;
			e?: string;
		}
	>(
		"/*",
		useAsync(async (req, res) => {
			const { userEntityId, projectName, revision } = req.params;
			const r = await ProjectService.loadEntry(
				createEntityId(userEntityId),
				projectName,
				revision,
				req.path.slice(1)
			);
			if (typeof r === "string") {
				const lines = r.split(/\r\n|\n|\r/);
				const { s, e } = {
					s: 1,
					e: 1 + lines.length,
					...req.query
				};

				res.send(
					fromValue({
						text: lines.slice(s - 1, e - 1).join("\n")
					})
				);
			} else {
				res.send(
					fromValue({
						entries: r
					})
				);
			}
		})
	);

	return router;
};

export default defineRoute;
