import * as t from "io-ts";

export const route = (project: string, historyId: string): string =>
	`projects/${project}/histories/${historyId}/job`;
