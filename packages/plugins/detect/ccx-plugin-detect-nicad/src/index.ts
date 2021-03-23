import * as path from "path";
import * as fs from "fs-extra";
import {
	ClonePair,
	DetectionResult,
	Fragment,
	NiCadXMLFormat,
	NiCadXMLSource,
	Query,
	QueryParameters
} from "types";
import * as ChildProcess from "child_process";
import { parse } from "fast-xml-parser";

const nicadDir = "/NiCad-6.2";
const systemsDir = path.resolve(nicadDir, "systems");

const buildConfig = (parameters: QueryParameters): string => {
	const config: Record<string, string> = {
		threshold: parameters.threshold.toFixed(2),
		minsize: parameters.minsize.toFixed(),
		maxsize: parameters.maxsize.toFixed(),
		transform: parameters.transform ?? "none",
		rename: parameters.rename,
		filter: parameters.filter,
		abstract: parameters.abstract,
		normalize: parameters.normalize,
		cluster: parameters.cluster ? "yes" : "none",
		report: parameters.report ? "yes" : "none",
		include: `"${parameters.include ?? ""}"`,
		exclude: `"${parameters.exclude ?? ""}"`
	};

	return Object.entries(config)
		.map(([key, value]) => `${key}=${value}`)
		.join("\n");
};

const writeConfig = async (config: string): Promise<void> => {
	const configDir = path.resolve(nicadDir, "config");
	await fs.mkdir(configDir, { recursive: true });
	await fs.writeFile(path.resolve(configDir, "default.cfg"), config);
};

const execNiCad = async (args: string[]): Promise<string> => {
	const command = ["./nicad6", ...args].join(" ");
	console.log(`launch nicad with arguments: ${command}`);
	return new Promise((resolve, reject) => {
		ChildProcess.exec(command, { cwd: nicadDir }, (err, stdout, stderr) => {
			if (err) {
				reject(stdout);
			} else {
				resolve(stdout);
			}
		});
	});
};

const sourceToFragment = (
	target: string,
	systemPath: string,
	source: NiCadXMLSource
): Fragment => ({
	file: path.join(target, path.relative(systemPath, source.file)),
	begin: source.startline,
	end: source.endline + 1
});

const writeClonesJson = async (
	artifactsDir: string,
	result: DetectionResult
): Promise<void> => {
	const p = path.resolve(artifactsDir, "0");
	await fs.mkdir(p);
	await fs.writeFile(path.resolve(p, "clones.json"), JSON.stringify(result));
};

const convertResult = async (
	systemPath: string,
	parameters: QueryParameters
): Promise<DetectionResult> => {
	const x: string[] = [];
	if (parameters.rename !== "none") {
		x.push(parameters.rename);
	}
	if (parameters.filter !== "none") {
		x.push(parameters.filter);
	}
	if (parameters.abstract !== "none") {
		x.push(parameters.abstract);
	}
	const basePath = `system_${parameters.granularity}-${x.join("-")}-clones`;

	const resultPath = path.resolve(
		nicadDir,
		"systems",
		basePath,
		`${basePath}-${parameters.threshold.toFixed(2)}.xml`
	);

	console.log(`load result from ${resultPath}`);
	const rawResult: NiCadXMLFormat = parse(
		(await fs.readFile(resultPath)).toString(),
		{
			ignoreAttributes: false,
			attributeNamePrefix: "",
			parseAttributeValue: true
		}
	);

	const clonePairs: Array<ClonePair> = rawResult.clones.clone.map((c) => ({
		f1: sourceToFragment(parameters.directory, systemPath, c.source[0]),
		f2: sourceToFragment(parameters.directory, systemPath, c.source[1]),
		similarity: c.similarity
	}));

	return { clonePairs };
};

const readQuery = async (resources: string): Promise<Query> => {
	const str = await fs.readFile(path.resolve(resources, "query.json"));
	return JSON.parse(str.toString()) as Query;
};

(async () => {
	const resources = path.resolve(process.argv[2], "resources");
	const artifacts = path.resolve(process.argv[2], "artifacts");
	const repo = path.resolve(resources, "repo");
	const output = path.resolve(artifacts, "output");
	await fs.mkdirp(output);

	const query = await readQuery(resources);
	const config = buildConfig(query.parameters);
	const systemPath = path.resolve(systemsDir, "system");
	await fs.mkdirp(systemsDir);

	await fs.copy(
		path.resolve(
			repo,
			query.targets[0].revision,
			query.targets[0].directory
		),
		systemPath,
		{
			recursive: true,
			overwrite: true
		}
	);
	await writeConfig(config);

	const args = [
		query.parameters.granularity,
		query.parameters.language,
		systemPath,
		"default"
	];
	const stdout = await execNiCad(args);
	console.log(stdout);

	const result = await convertResult(systemPath, query.parameters);
	await writeClonesJson(artifacts, result);
	process.exit(0);
})().catch((err) => {
	console.log(err);
	process.exit(1);
});
