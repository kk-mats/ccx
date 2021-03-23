/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Params,
	RequestHandler
	// eslint-disable-next-line import/no-unresolved
} from "express-serve-static-core";

import * as t from "io-ts";
import { isLeft } from "fp-ts/lib/Either";

import RequestError from "../errors/RequestError";

const validateRequest = <T extends t.Props, P extends Params, ResBody, ReqBody>(
	typeDefinition: t.TypeC<T>
): RequestHandler<P, ResBody, ReqBody> => {
	return (req, res, next): any => {
		const d = typeDefinition.decode(req.body);
		if (isLeft(d)) {
			if (d.left[0] && d.left[0].context[0]) {
				const { value, context, message } = d.left[0];
				throw RequestError.unknownError(value, context[0].key, message);
			}
			throw RequestError.unknownError();
		}

		next();
	};
};

export default validateRequest;
