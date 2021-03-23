import express from "express";
import passport from "passport";

import * as session from "common/auth-client/api/v1/session";

import AuthenticationError from "errors/AuthenticationError";
import validateRequest from "common/server-only/middlewares/validateRequest";
import authenticated from "application/middlewares/authenticated";
import { fromValue } from "common/all/types/Result";

const router = express.Router();

// for checking session from browser client
router.get<Record<string, string>, session.GetResponse>(
	"/",
	authenticated,
	(req, res) => {
		if (req.isAuthenticated() && req.user) {
			res.send(
				fromValue({
					userId: req.user.userId
				})
			);
		}
	}
);

// for signing in
router.post<Record<string, string>, session.PostResponse, session.PostRequest>(
	"/",
	validateRequest(session.postRequest),
	passport.authenticate("local"),
	(req, res) => {
		if (req.isUnauthenticated() || !req.user) {
			throw AuthenticationError.invalidUserIdOrPassword();
		}
		res.send(
			fromValue({
				userId: req.user.userId
			})
		);
	}
);

// for signing out
router.delete<Record<string, string>, session.DeleteResponse>(
	"/",
	authenticated,
	(req, res) => {
		if (req.user) {
			req.logout();
			res.sendStatus(200);
		}
	}
);

export default router;
