import * as t from "io-ts";
import { detectionResult } from "../codecs";

type DetectionResult = t.TypeOf<typeof detectionResult>;

// eslint-disable-next-line no-undef
export default DetectionResult;
