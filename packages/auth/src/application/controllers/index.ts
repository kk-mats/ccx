import express from "express";

import v1 from "application/controllers/v1";
import proxy from "application/controllers/v1/proxy";

const router = express();

router.use("/v1", v1);
router.use("/:version", proxy);

export default router;
