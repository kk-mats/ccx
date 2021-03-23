import express from "express";

import AuthenticationError from "errors/AuthenticationError";

const authenticated = <T extends express.Request>(
	req: T,
	res: express.Response,
	next: express.NextFunction
): void => {
	if (req.isUnauthenticated()) {
		throw AuthenticationError.couldNotAuthenticated();
	}
	next();
};

export default authenticated;
