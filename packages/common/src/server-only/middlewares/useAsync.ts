/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import {
	Request,
	Response,
	Params,
	RequestHandler
	// eslint-disable-next-line import/no-unresolved
} from "express-serve-static-core";

const useAsync = <P extends Params, ResBody = any, ReqBody = any>(
	middleware: (
		req: Request<P, ResBody, ReqBody>,
		res: Response<ResBody>,
		next: express.NextFunction
	) => Promise<any>
): RequestHandler<P, ResBody, ReqBody> => {
	return (req, res, next): any => middleware(req, res, next).catch(next);
};

export default useAsync;
