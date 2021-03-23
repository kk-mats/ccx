import * as t from "io-ts";

import Result from "../../../../all/types/Result";
import { userId } from "../../../../all/codecs";

export const route = (): string => "user/check";

// POST /user/check
export const postRequest = t.type({
	userId: t.string
});

export type PostRequest = t.TypeOf<typeof postRequest>;

const postResponse = t.type({
	userId
});

export type PostResponse = Result<t.TypeOf<typeof postResponse>>;
