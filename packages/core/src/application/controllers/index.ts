import express from "express";

import user from "application/controllers/_user";
import { Registry } from "types/registry";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	router.use("/:userEntityId", user(registry));

	return router;
};

export default defineRoute;
