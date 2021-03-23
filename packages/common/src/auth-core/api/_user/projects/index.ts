import * as t from "io-ts";

import Result from "../../../../all/types/Result";
import { projectEntity } from "../../../../all/codecs";

export const route = (userId: string): string => `/${userId}/projects`;

// GET /:userId/projects
const getResponse = t.type({
	projects: t.array(projectEntity)
});

export type GetResponse = Result<t.TypeOf<typeof getResponse>>;

// POST /:userId/projects
export const postRequest = t.type({
	gitURL: t.string
});

export type PostRequest = t.TypeOf<typeof postRequest>;

const postResponse = projectEntity;

export type PostResponse = Result<t.TypeOf<typeof postResponse>>;

// DELETE /:userId/projects
