import * as t from "io-ts";
import {
	detectRequest,
	detectionTarget,
	rawTarget,
	rawDetectRequest,
	detectRequestParameter
} from "../codecs";

export type RawTarget = t.TypeOf<typeof rawTarget>;
export type RawDetectRequest = t.TypeOf<typeof rawDetectRequest>;

export type Target = t.TypeOf<typeof detectionTarget>;
export type DetectRequest = t.TypeOf<typeof detectRequest>;
export type DetectRequestParameter = t.TypeOf<typeof detectRequestParameter>;
