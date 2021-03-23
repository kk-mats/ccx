import express from "express";

import user from "application/controllers/v1/user";
import session from "application/controllers/v1/session";

const router = express();

router.use("/user", user);
router.use("/private/browser/session", session);

export default router;
