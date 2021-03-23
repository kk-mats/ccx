import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { TemporaryStoreRepository } from "domain/repository/TemporaryStoreRepository";

export class TemporaryStoreFileSystemRepository
	implements TemporaryStoreRepository {
	private rootDir: string;

	private pluginsRootDir: string;

	constructor() {
		this.rootDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}ccx-cache-`);
		this.pluginsRootDir = path.resolve(this.rootDir, "plugins");
		fs.mkdirSync(this.pluginsRootDir);
	}

	public pluginsRoot(): string {
		return this.pluginsRootDir;
	}

	public saveTemporaryPlugin(): void {
		const t = 0;
	}
}
