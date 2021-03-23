const configKeys = [
	"WORKERS",
	"CONTROLLER_HOST",
	"API_PORT",
	"GIT_PORT",
	"SESSION_SECRET",
	"SESSION_DB_URI",
	"DB_URI"
] as const;

type ConfigKeys = typeof configKeys[number];

export type RawGlobalConfig = Partial<Record<ConfigKeys, string>>;

type GlobalConfigObject = {
	apiAddr: string;
	gitAddr: string;
	sessionSecret: string;
	sessionDbUri: string;
	dbUri: string;
	workers: string[];
};

export class GlobalConfig {
	private config: GlobalConfigObject;

	public constructor(raw: RawGlobalConfig) {
		configKeys.forEach((key) => {
			if (raw[key] === undefined) {
				throw new Error(`Environment variable ${key} is required.`);
			}
		});

		this.config = {
			apiAddr: `${raw.CONTROLLER_HOST}:${raw.API_PORT}`,
			gitAddr: `${raw.CONTROLLER_HOST}:${raw.GIT_PORT}`,
			sessionSecret: raw.SESSION_SECRET as string,
			sessionDbUri: raw.SESSION_DB_URI as string,
			dbUri: raw.DB_URI as string,
			workers: (raw.WORKERS as string).split(",")
		};
	}

	public get<T extends keyof GlobalConfigObject>(
		key: T
	): GlobalConfigObject[T] {
		return this.config[key];
	}
}
