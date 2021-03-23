import * as t from "io-ts";

import Result from "../../../all/types/Result";

export const route = (): string => "private/browser/session";

// GET /session
const getResponse = t.type({
	userId: t.string
});

export type GetResponse = Result<t.TypeOf<typeof getResponse>>;

// POST /session
export const postRequest = t.type({
	userId: t.string,
	password: t.string
});

export type PostRequest = t.TypeOf<typeof postRequest>;

const postResponse = t.type({
	userId: t.string
});

export type PostResponse = Result<t.TypeOf<typeof postResponse>>;

// DELETE /session
export const deleteResponse = t.type({});

export type DeleteResponse = Result<t.TypeOf<typeof deleteResponse>>;
