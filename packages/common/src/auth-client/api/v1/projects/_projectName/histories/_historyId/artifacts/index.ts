const route = (project: string, historyId: string, filename: string): string =>
	`projects/${project}/histories/${historyId}/artifacts/${filename}`;

export default route;
