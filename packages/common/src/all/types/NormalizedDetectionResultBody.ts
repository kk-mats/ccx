import * as t from "io-ts";
import { normalizedDetectionResultBody } from "../codecs";

type NormalizedDetectionResultBody = t.TypeOf<
	typeof normalizedDetectionResultBody
>;

// eslint-disable-next-line no-undef
export default NormalizedDetectionResultBody;
