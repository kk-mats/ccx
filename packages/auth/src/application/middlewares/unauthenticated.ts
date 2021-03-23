import express from "express";

import { fromValue } from "common/all/types/Result";

const authenticated = <T extends express.Request>(
	req: T,
	res: express.Response,
	next: express.NextFunction
): void => {
	if (req.isAuthenticated() && req.user) {
		res.send(fromValue({ userId: req.user.userId }));
		return;
	}
	next();
};

export default authenticated;
