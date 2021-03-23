import * as path from "path";
import express from "express";
import serveStatic from "serve-static";
import errorHandler from "common/server-only/middlewares/errorHandler";

import initialize from "application/initialize";
import controllers from "application/controllers";
import logger from "utils/logger";

const app = initialize();
app.set("x-powered-by", false);
app.set("query parser", "extended");

if (process.env.URL_BASE === undefined) {
	throw new Error(`Environment variable "URL_BASE" is required.`);
}

const dist = path.resolve("..", "..", "dist", "client");
const index = path.resolve(dist, "index.html");
const serve = serveStatic(dist, { redirect: false, fallthrough: false });

app.use(`${process.env.URL_BASE}api`, controllers);
app.use(`${process.env.URL_BASE}`, (req, res, next) => {
	console.log(req.originalUrl)
	serve(req, res, ((err: unknown) => {
		if (err !== undefined) {
			res.sendFile(index);
		}
	}) as () => void);
});
app.use(errorHandler(logger));

const server = app.listen(80, () => {
	const address = server.address();
	if (!address) {
		logger.fatal(`Failed to start CCX Auth server on port 3000`);
	} else if (typeof address === "string") {
		logger.info(`CCX Auth server is running on ${address}`);
	} else {
		logger.info(
			`CCX Auth server is running on [${address.address}]:${address.port}`
		);
	}
});

process.on("unhandledRejection", (reason, promise) => {
	logger.fatal(`Unhandled rejection:
	${JSON.stringify(reason, undefined, 2)}
	${JSON.stringify(promise, undefined, 2)}`);
});
