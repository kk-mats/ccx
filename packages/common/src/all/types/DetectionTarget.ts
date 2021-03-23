import * as t from "io-ts";
import { detectionTarget } from "../codecs";

type DetectionTarget = t.TypeOf<typeof detectionTarget>;

// eslint-disable-next-line no-undef
export default DetectionTarget;
