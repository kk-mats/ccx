import express from "express";
import proxy from "express-http-proxy";

import RequestError from "common/server-only/errors/RequestError";

import authenticated from "application/middlewares/authenticated";
import logger from "utils/logger";

const router = express();

router.use(
	authenticated,
	proxy("localhost:4000", {
		proxyReqPathResolver: (req) => {
			if (req.user) {
				let url = req.originalUrl.split("/v1")[1];
				if (
					["projects", "detectors", "plugins"].some((path) =>
						req.path.startsWith(`/${path}`)
					)
				) {
					url = `/${req.user.userEntityId.toHexString()}${url}`;
				}

				logger.trace(`Proxy: Request ${req.originalUrl} -> ${url}`);
				return url;
			}

			throw RequestError.unknownError(
				req.body,
				undefined,
				"Proxy error happened on auth server"
			);
		}
	})
);

export default router;
