import express from "express";

import body from "application/controllers/_user/projects/_projectName/histories/_historyId/result/body";
import { Registry } from "types/registry";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	router.use("/:resultId/body", body(registry));
	return router;
};

export default defineRoute;
