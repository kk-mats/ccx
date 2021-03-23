import * as t from "io-ts";

import Result from "../../../../all/types/Result";

export const route = (): string => "user";

// POST /user
export const postRequest = t.type({
	userId: t.string,
	password: t.string
});

export type PostRequest = t.TypeOf<typeof postRequest>;

const postResponse = t.type({
	userId: t.string
});

export type PostResponse = Result<t.TypeOf<typeof postResponse>>;

// DELETE /user
export const deleteRequest = t.type({
	password: t.string
});

export type DeleteRequest = t.TypeOf<typeof deleteRequest>;

export const deleteResponse = t.type({});

export type DeleteResponse = t.TypeOf<typeof deleteResponse>;
