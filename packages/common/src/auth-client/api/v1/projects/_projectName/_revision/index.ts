import * as t from "io-ts";

import Result from "../../../../../../all/types/Result";
import { directoryEntry } from "../../../../../../all/codecs";

export const route = (
	project: string,
	revision: string,
	path?: string,
	begin?: number,
	end?: number
): string => {
	const query: string[] = [];

	if (begin !== undefined) {
		query.push(`s=${begin}`);
	}

	if (end !== undefined) {
		query.push(`e=${end}`);
	}

	const str = query.length > 0 ? `?${query.join("&")}` : "";

	return `projects/${project}/revisions/${revision}/${path || ""}${str}`;
};

// GET /:project/revisions/:revision
const getResponse = t.union([
	t.type({
		entries: t.array(directoryEntry)
	}),
	t.type({
		text: t.string
	})
]);

export type GetResponse = Result<t.TypeOf<typeof getResponse>>;
