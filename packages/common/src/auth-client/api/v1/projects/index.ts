import * as t from "io-ts";

import Result from "../../../../all/types/Result";
import { projectEntity } from "../../../../all/codecs";

export const route = (): string => "projects";

// GET /projects
const getResponse = t.type({
	projects: t.array(projectEntity)
});
export type GetResponse = Result<t.TypeOf<typeof getResponse>>;

// POST /projects
export const postRequest = t.type({
	gitURL: t.string,
	name: t.union([t.string, t.undefined])
});

export type PostRequest = t.TypeOf<typeof postRequest>;

const postResponse = projectEntity;

export type PostResponse = Result<t.TypeOf<typeof postResponse>>;
