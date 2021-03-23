import express from "express";
import passport from "passport";

import useAsync from "common/server-only/middlewares/useAsync";
import * as user from "common/auth-client/api/v1/user";

import authenticated from "application/middlewares/authenticated";
import validateRequest from "common/server-only/middlewares/validateRequest";
import check from "application/controllers/v1/user/check";

import RegisteringUser from "domain/commands/RegisteringUser";
import DeletingUser from "domain/commands/DeletingUser";
import { fromValue } from "common/all/types/Result";

const router = express.Router();

// for sign up
router.post<Record<string, string>, user.PostResponse, user.PostRequest>(
	"/",
	validateRequest(user.postRequest),
	useAsync(async (req, res, next) => {
		const { userId, password } = req.body;
		await new RegisteringUser(userId, password).exec();
		next();
	}),
	passport.authenticate("local"),
	(req, res) => {
		res.send(
			fromValue({
				userId: req.body.userId
			})
		);
	}
);

// for deleting an account
router.delete<Record<string, string>, user.DeleteResponse, user.DeleteRequest>(
	"/",
	authenticated,
	validateRequest(user.deleteRequest),
	useAsync(async (req, res) => {
		if (req.user) {
			await new DeletingUser(req.user, req.body.password).exec();
			res.send();
		}
	})
);

router.use("/check", check);

export default router;
