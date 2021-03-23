import * as fs from "fs/promises";
import * as path from "path";
import { decode, runCCFinderX } from "common";
import { DetectionResult, Query } from "types";
import { convertResult } from "convert";

const writeClonesJson = async (
	artifactsDir: string,
	result: DetectionResult
): Promise<void> => {
	const p = path.resolve(artifactsDir, "0");
	await fs.mkdir(p)
	await fs.writeFile(
		path.resolve(p, "clones.json"),
		JSON.stringify(result)
	);
}

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
	const ccfxd = path.resolve(output, "clones.ccfxd");

	const args: string[] = ["d"];
	args.push(parameters.language);
	args.push("-b", parameters.b.toFixed());
	args.push("-t", parameters.t.toFixed());
	args.push("-w", parameters.w);
	args.push("-dn", path.resolve(repo, directory));
	args.push("-o", ccfxd);
	if (parameters.l !== undefined && parameters.l !== null) {
		const fileList = path.resolve(output, "filelist.txt");
		await fs.writeFile(fileList, parameters.l.join("\n"));
		args.push("-l", fileList);
	}
	if (parameters.is !== undefined && parameters.is !== null) {
		const isResolved = path.resolve(repo, parameters.is);
		args.push("-is", isResolved);
	}

	const code = await runCCFinderX(args);
	if (code !== null) {
		console.log(`CCFinderX exited with code ${code}.`);
	}

	const result = await convertResult(ccfxd, output, repo, directory);
	await writeClonesJson(artifacts, result);
	process.exit(0);
})().catch((err) => {
	if (err instanceof Error) {
		console.log(err.message);
	} else {
		console.log(err);
	}
	process.exit(1);
});
