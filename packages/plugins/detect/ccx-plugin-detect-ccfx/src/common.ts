import * as path from "path";
import * as childProcess from "child_process";

import jschardet from "jschardet";
import iconv from "iconv-lite";

const binPath = path.resolve("C:/ccfx-win32-en", "bin", "ccfx.exe");

export const decode = (raw: Buffer): string => {
	const e = jschardet.detect(raw);
	return e.encoding ? iconv.decode(raw, e.encoding) : raw.toString();
};

export const runCCFinderX = async (args: string[]): Promise<number | null> =>
	new Promise((resolve, reject) => {
		console.log(`Run CCFinderX with arguments: [${args.join(",")}]`)
		const p = childProcess.spawn(binPath, args);
		
		p.stdout.on("data", (data) => {
			console.log(data.toString());
		});

		p.stderr.on("data", (data) => {
			console.log(data.toString());
		});

		p.on("error", (err) => { reject(err); });
		p.on("close", (code) => { resolve(code); });
	});
