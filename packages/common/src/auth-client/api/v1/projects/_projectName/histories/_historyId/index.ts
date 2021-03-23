import * as t from "io-ts";

import Result from "../../../../../../../all/types/Result";
import { historyEntityForClient } from "../../../../../../../all/codecs";

export const route = (project: string, historyId: string): string =>
	`projects/${project}/histories/${historyId}`;

// GET /:project/histories/:historyId
const getResponse = historyEntityForClient;

export type GetResponse = Result<t.TypeOf<typeof getResponse>>;