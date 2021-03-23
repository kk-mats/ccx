import express from "express";

import useAsync from "common/server-only/middlewares/useAsync";
import * as check from "common/auth-client/api/v1/user/check";

import validateRequest from "common/server-only/middlewares/validateRequest";
import CheckingUserId from "domain/query/CheckingUserId";
import { fromValue } from "common/all/types/Result";

const router = express.Router();

// for checking user ID availability
router.post<Record<string, string>, check.PostResponse, check.PostRequest>(
	"/",
	validateRequest(check.postRequest),
	useAsync(async (req, res) => {
		const { userId } = req.body;
		res.send(
			fromValue({
				userId: await new CheckingUserId(userId).exec()
			})
		);
	})
);

export default router;
