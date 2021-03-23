import * as fs from "fs/promises";
import * as path from "path";
import * as yaml from "js-yaml";
import * as childProcess from "child_process";
import git from "simple-git";
import { v4 as uuidv4 } from "uuid";

import { decodeRawDetectPluginConfig } from "common/all/utils/decodeRawDetectPluginConfig";

import logger from "utils/logger";
import {
	AvailableDetectPlugins,
	PluginId,
	DetectPluginSchema,
	PluginOwner,
	DetectPluginConfig
} from "common/all/types/plugin";
import { DetectPlugin } from "common/server-only/types/plugin";
import { PluginRepository } from "domain/repository/PluginRepository";
import { InternalUserEntityId } from "common/server-only/value-objects/EntityId";

export const pluginOwnerGlobal = "global";

type DetectPluginRecord = Record<string, DetectPlugin>;

const detectPluginConfigToSchema = (
	id: string,
	config: DetectPluginConfig
): DetectPluginSchema => ({
	id: id as PluginId,
	name: config.name,
	variants: config.variants
});

export class PluginFileSystemRepository implements PluginRepository {
	private globalDetectPluginCache: DetectPluginRecord = {};

	private pluginsRoot: string = path.resolve(this.storeRoot, "plugins");

	private globalDetectPluginRoot = path.resolve(
		this.pluginsRoot,
		"global",
		"detect"
	);

	private privatePluginRoot = path.resolve(
		this.pluginsRoot,
		"private"
	);

	private gitDaemon: childProcess.ChildProcess | undefined = undefined;

	private constructor(private storeRoot: string) {}

	public static async init(
		storeRoot: string
	): Promise<PluginFileSystemRepository> {
		const r = new PluginFileSystemRepository(storeRoot);

		await fs.mkdir(r.globalDetectPluginRoot, { recursive: true });
		const repo = git(r.pluginsRoot);
		await repo.init();
		logger.info(
			`[initialization] initialized ${r.pluginsRoot} as a git repository for plugins`
		);

		await repo.addConfig("user.email", "k-matusm@ist.osaka-u.ac.jp");
		await repo.addConfig("user.name", "CCX");

		// eslint-disable-next-line camelcase
		const files = (await repo.status()).files.map((status) => status.path);

		if (files.length > 0) {
			await repo.add(files);
			await repo.commit("update on ccx initialization");
			logger.trace(
				`[initialization] commit changes of plugins repository: [\n\t${files.join(
					",\n\t"
				)}\n]`
			);
		}

		r.globalDetectPluginCache = await r.loadGlobalDetectPlugins();
		return r;
	}

	public startGitDaemon(): void {
		const args = [
			"daemon",
			"--export-all",
			`--base-path=${this.storeRoot}`,
			`--port=${process.env.GIT_PORT}`
		];

		this.gitDaemon = childProcess.spawn("git", args, {
			cwd: this.storeRoot
		});

		logger.info(`[git daemon] start with command: "git ${args.join(" ")}"`);

		this.gitDaemon.on("exit", (signal) => {
			logger.info(`[git daemon] exited: ${signal}`);
		});
		this.gitDaemon.on("error", (err) => {
			logger.warn(`[git daemon] error: ${err}`);
		});
		this.gitDaemon.stdout?.on("data", (data) => {
			logger.trace(`[git daemon] message from git daemon: ${data}`);
		});

		process.on("exit", () => {
			this.gitDaemon?.kill();
		});
	}

	private privateDetectPluginRoot(
		internalUserEntityId: InternalUserEntityId
	): string {
		return path.resolve(
			this.privatePluginRoot,
			internalUserEntityId.toHexString(),
			"detect"
		);
	}

	private async loadGlobalDetectPlugins(): Promise<DetectPluginRecord> {
		const entries = await fs.readdir(this.globalDetectPluginRoot);

		if (entries.length < 1) {
			throw new Error(
				`There is no global plugin in ${this.globalDetectPluginRoot}`
			);
		}

		const record: DetectPluginRecord = {};
		const plugins = await Promise.all(
			entries.map((entry) => this.loadGlobalDetectPlugin(entry))
		);
		plugins.forEach((plugin) => {
			if (plugin != null) {
				record[plugin.id] = plugin;
				logger.trace(`load global detect plugin: ${plugin.id}`);
			}
		});

		if (Object.keys(record).length < 1) {
			throw new Error(
				`There is no valid global plugin in ${this.globalDetectPluginRoot}`
			);
		}

		return record;
	}

	private async loadGlobalDetectPlugin(
		entry: string
	): Promise<DetectPlugin | null> {
		return PluginFileSystemRepository.loadDetectPlugin(
			this.globalDetectPluginRoot,
			entry
		);
	}

	private static async loadDetectPlugin(
		parent: string,
		entry: string
	): Promise<DetectPlugin | null> {
		const pluginPath = path.resolve(parent, entry);
		const config = await PluginFileSystemRepository.loadDetectPluginConfig(
			pluginPath
		);
		if (config != null) {
			return {
				id: entry as PluginId,
				owner: pluginOwnerGlobal as PluginOwner,
				...config
			};
		}

		logger.warn(`${entry} in ${parent} is not a valid detect plugin`);

		return null;
	}

	private static async loadDetectPluginConfig(
		pluginPath: string
	): Promise<DetectPluginConfig | null> {
		const configPath = path.resolve(pluginPath, "plugin.yml");
		try {
			const str = await fs.readFile(configPath, "utf8");
			const raw = yaml.load(str);

			const result = decodeRawDetectPluginConfig(raw);
			if (result.value) {
				return (result.value as unknown) as DetectPluginConfig;
			}

			logger.warn(
				`${configPath} is not a valid detect plugin config: \n${result.report.join(
					"\n\t"
				)}`
			);
		} catch (err) {
			logger.warn(
				`Failed to load CCX detect plugin config from ${configPath}: ${err}`
			);
		}
		return null;
	}

	public async findDetectPlugin(
		id: string,
		owner: string
	): Promise<DetectPlugin | null> {
		if (owner === pluginOwnerGlobal) {
			return this.globalDetectPluginCache[id] ?? null;
		}

		const pluginPath = path.resolve(
			this.privatePluginRoot,
			owner,
			"detect",
			id
		);
		const config = await PluginFileSystemRepository.loadDetectPluginConfig(
			pluginPath
		);
		if (config != null) {
			return {
				id: id as PluginId,
				owner: owner as PluginOwner,
				...config
			};
		}

		return null;
	}

	public async detectPlugins(
		internalUserEntityId: InternalUserEntityId
	): Promise<AvailableDetectPlugins> {
		const r: AvailableDetectPlugins = {
			global: Object.entries(
				this.globalDetectPluginCache
			).map(([id, config]) => detectPluginConfigToSchema(id, config)),
			private: []
		};

		const parent = this.privateDetectPluginRoot(internalUserEntityId);
		try {
			const entries = await fs.readdir(parent);
			await Promise.all(
				entries.map(
					async (entry): Promise<void> => {
						const config = await PluginFileSystemRepository.loadDetectPlugin(
							parent,
							entry
						);
						if (config) {
							r.private.push(config);
						}
					}
				)
			);
		} catch (err) {
			logger.warn(`failed to load private plugins: ${err}`);
		}
		return r;
	}

	public async savePrivateDetectPlugin(
		internalUserEntityId: InternalUserEntityId,
		config: DetectPluginConfig
	): Promise<PluginId> {
		const dir = this.privateDetectPluginRoot(internalUserEntityId);
		const configYaml = yaml.dump(config);
		try {
			const pluginId = uuidv4();
			const p = path.resolve(dir, pluginId);
			await fs.mkdir(p, { recursive: true });
			await fs.writeFile(path.resolve(p, "plugin.yml"), configYaml);
			return pluginId as PluginId;
		} catch (err) {
			const pluginId = uuidv4();
			const p = path.resolve(dir, pluginId);
			await fs.mkdir(p, { recursive: true });
			await fs.writeFile(path.resolve(p, "plugin.yml"), configYaml);
			return pluginId as PluginId;
		}
	}
}
