import * as t from "io-ts";

import Result from "../../../../../../all/types/Result";
import {
	historyId,
	historyEntityForClient,
	rawDetectRequest
} from "../../../../../../all/codecs";

export const route = (project: string): string =>
	`projects/${project}/histories`;

// GET /:project/histories
const getResponse = t.type({
	histories: t.array(historyEntityForClient)
});

export type GetResponse = Result<t.TypeOf<typeof getResponse>>;

// POST /:project/histories
export const postRequest = rawDetectRequest;
export type PostRequest = t.TypeOf<typeof postRequest>;

const postResponse = t.type({
	historyId
});
export type PostResponse = Result<t.TypeOf<typeof postResponse>>;

// DELETE /:project/histories?id={id},{id},...
const deleteResponse = t.type({});
export type DeleteResponse = Result<t.TypeOf<typeof deleteResponse>>;
