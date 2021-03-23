import express from "express";
import * as Boom from "@hapi/boom";
import { Logger } from "log4js";

import ErrorBase from "../../all/types/ErrorBase";
import { fromError } from "../../all/types/Result";

class InternalError extends ErrorBase {
	constructor() {
		super(Boom.badImplementation());
	}
}

const errorHandler = (logger: Logger): express.ErrorRequestHandler => {
	return (err, req, res, next): unknown => {
		if (res.headersSent) {
			return next(err);
		}

		if (err instanceof ErrorBase) {
			const error = err.toObject();
			return res.status(error.statusCode).send(fromError(err));
		}

		logger.error(`request:
			${(req.body, undefined, 2)}
		error:
			${err}
		`);

		return res.status(500).send(fromError(new InternalError()));
	};
};

export default errorHandler;
