import * as path from "path";
import * as fs from "fs/promises";
import {
	CloneSet,
	DetectionResult,
	Fragment,
	Query,
	QueryParameters
} from "types";
import { configTemplate } from "configTemplate";
import * as ChildProcess from "child_process";

const deckardRoot = "/Deckard";
const deckardSh = path.resolve(
	deckardRoot,
	"scripts",
	"clonedetect",
	"deckard.sh"
);

const buildConfig = (
	parameters: QueryParameters,
	outputDir: string,
	repoDir: string
): string => {
	const config: string[] = [];

	const addConfig = (key: string, value: unknown) => {
		config.push(`${key}="${value}"`);
	};

	const outputPathOf = (name: string) => path.resolve(outputDir, name);
	const clustersDir = outputPathOf("clusters");

	addConfig("FILE_PATTERN", parameters.language);
	addConfig("SRC_DIR", path.resolve(repoDir, parameters.target));
	addConfig("PDG_DIR", outputPathOf("pdgs"));
	addConfig("AST_DIR", outputPathOf("asts"));
	addConfig("TYPE_FILE", outputPathOf("AstNodeTypeNamesIDs.txt"));
	addConfig("RELEVANT_NODEFILE", outputPathOf("AstRelevantNodes.txt"));
	addConfig("LEAF_NODEFILE", outputPathOf("AstLeafNodes.txt"));
	addConfig("PARENT_NODEFILE", outputPathOf("AstParentNodes.txt"));
	addConfig("VECTOR_DIR", outputPathOf("vectors"));
	addConfig("CLUSTER_DIR", clustersDir);
	addConfig("TIME_DIR", outputPathOf("times"));
	addConfig("DECKARD_DIR", deckardRoot);

	addConfig("MIN_TOKENS", parameters.minTokens.join(" "));
	addConfig("STRIDE", parameters.stride.join(" "));
	addConfig("SIMILARITY", parameters.similarity.join(" "));

	return config.join("\n");
};

const writeConfig = async (tmpDir: string, config: string): Promise<void> => {
	await fs.writeFile(
		path.resolve(tmpDir, "config"),
		`${config}\n${configTemplate}`
	);
};

const execDeckard = async (tmpDir: string): Promise<number | null> =>
	new Promise((resolve, reject) => {
		const p = ChildProcess.spawn(deckardSh, { cwd: tmpDir });

		p.stdout.on("data", (data) => {
			console.log(data.toString());
		});
		p.stderr.on("data", (data) => {
			console.log(data.toString());
		});

		p.on("error", (err) => { reject(err); });
		p.on("close", (code) => { resolve(code); });
	});

const fragmentRegex = new RegExp(
	/^\d+\s+dist:\d+\.\d+\s+FILE\s(.+)\sLINE:(\d+):(\d+).+$/
);
const parseFragment = (line: string, repoDir: string): Fragment => {
	const result = line.match(fragmentRegex);

	if (result) {
		const [_, file, beginStr, endStr] = result;
		return {
			file: path.relative(repoDir, file),
			begin: Number.parseInt(beginStr, 10),
			end: Number.parseInt(endStr, 10)
		};
	}

	throw new Error(`failed to parse fragment: ${line}`);
};

const parseResult = async (
	resultPath: string,
	repoDir: string
): Promise<CloneSet[]> => {
	const buf = await fs.readFile(resultPath);
	const lines = buf.toString().split(/\r\n|\n/);

	const cloneSets: CloneSet[] = [];
	let fragments: Fragment[] = [];

	lines.forEach((line) => {
		const trimmed = line.trim();

		if (trimmed === "") {
			if (fragments.length > 0) {
				cloneSets.push({ fragments });
				fragments = [];
			}
			return;
		}

		fragments.push(parseFragment(line, repoDir));
	});

	return cloneSets;
};

const writeClonesJson = async (
	artifactsDir: string,
	index: number,
	result: DetectionResult
): Promise<void> => {
	const p = path.resolve(artifactsDir, index.toFixed());
	fs.mkdir(p);
	await fs.writeFile(path.resolve(p, "clones.json"), JSON.stringify(result));
};

const convertResults = async (
	artifactsDir: string,
	outputDir: string,
	parameters: QueryParameters,
	repoDir: string
): Promise<void> => {
	const { minTokens, stride, similarity } = parameters;
	const combinations = minTokens.flatMap((m) =>
		stride.flatMap((st) => similarity.flatMap((sim) => ({ m, st, sim })))
	);

	await Promise.all(
		combinations.map(async ({ m, st, sim }, index) => {
			const resultPath = path.resolve(
				outputDir,
				"clusters",
				`cluster_vdb_${m}_${st}_allg_${sim}_30`
			);
			const cloneSets = await parseResult(resultPath, repoDir);
			await writeClonesJson(artifactsDir, index, {
				parameters: {
					...parameters,
					minTokens: [m],
					stride: [st],
					similarity: [sim]
				},
				cloneSets
			});
		})
	);
};

const readQuery = async (resources: string): Promise<Query> => {
	const str = await fs.readFile(path.resolve(resources, "query.json"));
	return JSON.parse(str.toString()) as Query;
};

(async () => {
	const resources = path.resolve(process.argv[2], "resources");
	const artifacts = path.resolve(process.argv[2], "artifacts");

	const query = await readQuery(resources);
	console.log("read query:", JSON.stringify(query))

	const repo = path.resolve(resources, "repo", query.targets[0].revision);
	const output = path.resolve(artifacts, "output");
	await fs.mkdir(output, { recursive: true });

	const config = buildConfig(query.parameters, output, repo);
	console.log("write config");
	await writeConfig("/tmp", config);

	const code = await execDeckard("/tmp");
	console.log(`Deckard exited with code ${code}`);
	console.log("convert result");
	await convertResults(artifacts, output, query.parameters, repo);
	console.log("finished to convert results.");
	process.exit(0);
})().catch((err) => {
	console.log(err);
	process.exit(1);
});
