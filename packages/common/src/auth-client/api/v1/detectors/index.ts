import * as t from "io-ts";

import { AvailableDetectPlugins } from "../../../../all/types/plugin";
import Result from "../../../../all/types/Result";

export const route = (): string => "detectors";

// GET /detectors

export type GetResponse = Result<AvailableDetectPlugins>;
