import * as fs from "fs/promises";
import * as path from "path";
import * as childProcess from "child_process";
import { ClonePair, DetectionResult, Fragment, Query } from "types";

const jarPath = path.resolve("C:/CCVolti/ccvolti.jar");

export const runCCVolti = async (args: string[]): Promise<number | null> =>
	new Promise((resolve, reject) => {
		const p = childProcess.spawn("java", args);

		p.stdout.on("data", (data) => {
			console.log(data.toString());
		});
		p.stderr.on("data", (data) => {
			console.log(data.toString());
		});

		p.on("error", (err) => reject(err));
		p.on("close", (code) => resolve(code));
	});

const toFragment = (
	file: string,
	start: string,
	end: string,
	repoPath: string
): Fragment => ({
	file: path.relative(repoPath, file),
	begin: Number.parseInt(start, 10),
	end: Number.parseInt(end, 10)
});

const readClonePair = (line: string, repoPath: string): ClonePair => {
	const elements = line.split(",").map((e) => e.trim());

	return {
		f1: toFragment(elements[1], elements[2], elements[3], repoPath),
		f2: toFragment(elements[7], elements[8], elements[9], repoPath),
		similarity: Number.parseFloat(elements[12])
	};
};

const convert = async (
	oc: string,
	repoPath: string
): Promise<DetectionResult> => {
	const lines = (await fs.readFile(oc, { encoding: "utf-8" })).split(/\r?\n/);

	const clonePairs = lines
		.slice(1)
		.map((line) => readClonePair(line, repoPath));

	return { clonePairs };
};

const writeClonesJson = async (
	artifactsDir: string,
	result: DetectionResult
): Promise<void> =>
	fs.writeFile(
		path.resolve(artifactsDir, "clones.json"),
		JSON.stringify(result)
	);

const readQuery = async (resources: string): Promise<Query> => {
	const str = await fs.readFile(path.resolve(resources, "query.json"));
	return JSON.parse(str.toString()) as Query;
};

(async () => {
	const resources = path.resolve(process.argv[2], "resources");
	const artifacts = path.resolve(process.argv[2], "artifacts");
	const output = path.resolve(artifacts, "output");
	await fs.mkdir(output, { recursive: true });

	console.log("reading query");
	const { targets, parameters } = await readQuery(resources);
	const [{ directory, revision }] = targets;
	const repo = path.resolve(resources, "repo", revision);
	let removeOc = false;

	const args = ["-jar", jarPath];

	args.push("-d", path.resolve(repo, directory));
	args.push("-l", parameters.l);

	if (parameters.ot !== undefined && parameters.ot !== null) {
		args.push("-ot", path.resolve(output, parameters.ot));
	}
	if (parameters.on !== undefined && parameters.on !== null) {
		args.push("-on", path.resolve(output, parameters.on));
	}
	if (parameters.ocs !== undefined && parameters.ocs !== null) {
		args.push("-ocs", path.resolve(output, parameters.ocs));
	}

	if (parameters.sim !== undefined && parameters.sim !== null) {
		args.push("--sim", path.resolve(output, parameters.sim.toString()));
	}

	if (parameters.size !== undefined && parameters.size !== null) {
		args.push("--size", path.resolve(output, parameters.size.toFixed()));
	}

	if (parameters.sizeb !== undefined && parameters.sizeb !== null) {
		args.push("--sizeb", path.resolve(output, parameters.sizeb.toFixed()));
	}

	args.push("-t", "0");

	let { oc } = parameters;
	if (oc === undefined || oc === null) {
		oc = "oc.csv";
		removeOc = true;
		console.log(`Run CCVolti with arguments: [${args.join(",")}]`);
		args.push("-oc", path.resolve(output, oc));
	} else {
		args.push("-oc", path.resolve(output, oc));
		console.log(`Run CCVolti with arguments: [${args.join(",")}]`);
	}

	const code = await runCCVolti(args);
	console.log(`CCVolti exited with code ${code}`);

	const result = await convert(oc, repo);
	await writeClonesJson(artifacts, result);

	if (removeOc) {
		await fs.rm(oc);
	}
	process.exit(0);
})().catch((err) => {
	if (err instanceof Error) {
		console.error(err.message);
	} else {
		console.error(err);
	}
	process.exit(1);
});
