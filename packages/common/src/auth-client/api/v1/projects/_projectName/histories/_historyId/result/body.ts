import * as t from "io-ts";

import Result from "../../../../../../../../all/types/Result";
import { normalizedDetectionResultBody } from "../../../../../../../../all/codecs";

export const route = (
	project: string,
	historyId: string,
	resultId: string
): string =>
	`projects/${project}/histories/${historyId}/result/${resultId}/body`;

// GET /:project/histories/:historyId/result/body
const getResponse = normalizedDetectionResultBody;

export type GetResponse = Result<t.TypeOf<typeof getResponse>>;
