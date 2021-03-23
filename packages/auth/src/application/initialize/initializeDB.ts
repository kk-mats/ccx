import mongoose from "mongoose";

import logger from "utils/logger";

const initializeDB = (): void => {
	mongoose.set("debug", process.env.NODE_ENV === "development");

	mongoose.connection.on("connected", () => {
		logger.info("Mongoose default connection is open.");
	});

	mongoose.connection.on("error", (err) => {
		logger.fatal(`Mongoose default connection has occurred:
		${JSON.stringify(err, undefined, 2)}`);
	});

	mongoose.connection.on("disconnected", () => {
		logger.info("Mongoose default connection is disconnected.");
	});

	mongoose.connect(process.env.DB_URI as string, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false
	});
};

export default initializeDB;
