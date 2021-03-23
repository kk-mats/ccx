import * as t from "io-ts";

export const route = (project: string): string => `projects/${project}/check`;

// GET /private/check
const getResponse = t.partial({
	directory: t.string,
	revision: t.string
});
export type GetResponse = t.TypeOf<typeof getResponse>;
