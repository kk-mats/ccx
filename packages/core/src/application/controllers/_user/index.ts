import express from "express";

import projects from "application/controllers/_user/projects";
import detectors from "application/controllers/_user/detectors";
import plugins from "application/controllers/_user/plugins";
import { Registry } from "types/registry";

const router = express.Router({ mergeParams: true });

const defineRoute = (registry: Registry): express.Router => {
	router.use("/projects", projects(registry));
	router.use("/detectors", detectors(registry));
	router.use("/plugins", plugins(registry));
	return router;
};

export default defineRoute;
