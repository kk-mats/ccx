import * as t from "io-ts";

import Result from "../../../../../all/types/Result";
import { projectEntity } from "../../../../../all/codecs";

export const route = (project: string): string => `projects/${project}`;

// GET /:project
const getResponse = projectEntity;
export type GetResponse = Result<t.TypeOf<typeof getResponse>>;

// DELETE /:project
const deleteResponse = t.type({});
export type DeleteResponse = Result<t.TypeOf<typeof deleteResponse>>;
