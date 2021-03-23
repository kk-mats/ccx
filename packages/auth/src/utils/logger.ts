import * as path from "path";
import log4js from "log4js";

log4js.configure({
	appenders: {
		errorFile: {
			type: "file",
			filename: path.resolve("/ccx_logs", "ccx.auth.error.log")
		},
		error: {
			type: "logLevelFilter",
			appender: "errorFile",
			level: "error"
		},
		errorDevConsole: { type: "stderr" },
		errorDev: {
			type: "logLevelFilter",
			appender: "errorDevConsole",
			level: "error"
		},
		normalDev: { type: "console" },
		normal: {
			type: "file",
			filename: path.resolve("/ccx_logs", "ccx.auth.log")
		}
	},
	categories: {
		default: { appenders: ["error", "normal"], level: "info" },
		development: {
			appenders: ["errorDev", "normalDev"],
			level: "trace"
		}
	}
});

const logger = log4js.getLogger(
	process.env.NODE_ENV === "development" ? "development" : "default"
);

export default logger;
