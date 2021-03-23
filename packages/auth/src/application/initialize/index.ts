import * as express from "express";

import initializeDB from "application/initialize/initializeDB";
import initializeServer from "application/initialize/initializeServer";

const initialize = (): express.Express => {
	initializeDB();
	return initializeServer();
};

export default initialize;
