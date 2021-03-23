import { ExecutionService } from "domain/services/ExecutionService";
import { Registry } from "types/registry";
import logger from "utils/logger";

export class Executor {
	constructor(private registry: Registry) {}

	public waitJob(): void {
		const service = new ExecutionService(this.registry);
		setTimeout(async function f() {
			try {
				await service.exec();
				setTimeout(f, 5000);
			} catch (err) {
				logger.error(`scheduler error: ${err}`);
			}
		}, 5000);
	}
}
