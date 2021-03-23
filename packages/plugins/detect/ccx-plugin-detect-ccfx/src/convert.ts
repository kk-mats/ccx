import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import {
	CCFXClonePair,
	CCFXFile,
	CCFXFragment,
	ClonePair,
	DetectionResult,
	Fragment
} from "types";
import { runCCFinderX } from "common";

const fileMapRegex = /^(\d+)\s+(.+)\s+(\d+)$/;
const clonePairRegex = /^\d+\s+(\d+)\.(\d+)-(\d+)\s+(\d+)\.(\d+)-(\d+)$/;
const prepTokenRegex = /^([\da-f]+)\.[\da-f]+\.[\da-f]+\s\+[\da-f]+\s.+$/;

type State = "source_files" | "clone_pairs" | null;

const postfixHead = "option: -preprocessed_file_postfix";

const readFileMap = (line: string, repoPath: string): CCFXFile | null => {
	const r = fileMapRegex.exec(line);
	if (r === null) {
		return null;
	}

	return {
		id: Number.parseInt(r[1], 10),
		path: path.relative(repoPath, r[2])
	};
};

const readFragment = (
	file: string,
	begin: string,
	end: string,
	files: Record<number, CCFXFile>
): CCFXFragment => ({
	file: files[Number.parseInt(file, 10)],
	tokenBegin: Number.parseInt(begin, 10),
	tokenEnd: Number.parseInt(end, 10)
});

const readClonePair = (
	line: string,
	files: Record<string, CCFXFile>
): CCFXClonePair => {
	const r = clonePairRegex.exec(line);
	if (r === null) {
		throw new Error(`failed to parse line: ${line}`);
	}
	return {
		f1: readFragment(r[1], r[2], r[3], files),
		f2: readFragment(r[4], r[5], r[6], files)
	};
};

const readCCFXResult = async (
	printingPath: string,
	repoPath: string
): Promise<{
	postfix: string;
	clonePairs: CCFXClonePair[];
}> => {
	const rl = readline.createInterface(fs.createReadStream(printingPath));

	let state: State = null;
	let postfix = "";
	const fileMap: Record<string, CCFXFile> = {};
	const clonePairs: CCFXClonePair[] = [];

	// eslint-disable-next-line no-restricted-syntax
	for await (const line of rl) {
		if (line.startsWith("}")) {
			state = null;
		} else {
			switch (state) {
				case "source_files": {
					const file = readFileMap(line, repoPath);
					if (file) {
						fileMap[file.id] = file;
					}
					break;
				}

				case "clone_pairs": {
					clonePairs.push(readClonePair(line, fileMap));
					break;
				}

				default: {
					const index = line.indexOf(postfixHead);

					if (index >= 0) {
						postfix = line
							.slice(index + postfixHead.length + 1)
							.trim();
					} else if (line.startsWith("source_files {")) {
						state = "source_files";
					} else if (line.startsWith("clone_pairs {")) {
						state = "clone_pairs";
					}
				}
			}
		}
	}

	return { postfix, clonePairs };
};

const cache: Record<string, string[]> = {};
const normalizeCCFXFragment = async (
	f: CCFXFragment,
	target: string,
	prepDir: string,
	postfix: string
): Promise<Fragment> => {
	let lines = cache[f.file.id];
	if (lines === undefined) {
		lines = (
			await fs.promises.readFile(
				path.resolve(
					prepDir,
					`${path.relative(target, f.file.path)}${postfix}`
				)
			)
		)
			.toString()
			.split(/\r\n|\n/);
		cache[f.file.id] = lines;
	}

	const beginPrep = prepTokenRegex.exec(lines[f.tokenBegin]);
	const endPrep = prepTokenRegex.exec(lines[f.tokenEnd]);

	if (beginPrep === null || endPrep === null) {
		throw new Error(`failed to convert result`);
	}

	return {
		file: f.file.path,
		begin: Number.parseInt(beginPrep[1], 16),
		end: Number.parseInt(endPrep[1], 16)
	};
};

const normalizeCCFXClonePairs = (
	clonePairs: CCFXClonePair[],
	targetRelative: string,
	prepDir: string,
	postfix: string
): Promise<ClonePair>[] =>
	clonePairs.map(async ({ f1, f2 }) => ({
		f1: await normalizeCCFXFragment(f1, targetRelative, prepDir, postfix),
		f2: await normalizeCCFXFragment(f2, targetRelative, prepDir, postfix)
	}));

export const convertResult = async (
	ccfxd: string,
	output: string,
	repoPath: string,
	targetRelative: string
): Promise<DetectionResult> => {
	const printed = path.resolve(output, "clones.txt");

	const code = await runCCFinderX(["p", ccfxd, "-o", printed]);
	if (code !== null) {
		console.log(`CCFinderX exited with code ${code}.`);
	}

	const prepDir = path.resolve(repoPath, targetRelative, ".ccfxprepdir");
	const { postfix: prepPostfix, clonePairs } = await readCCFXResult(
		printed,
		repoPath
	);

	return {
		clonePairs: await Promise.all(
			normalizeCCFXClonePairs(
				clonePairs,
				targetRelative,
				prepDir,
				prepPostfix
			)
		)
	};
};
