import * as t from "io-ts";
import { summary } from "../codecs";

type DetectionResultSummary = t.TypeOf<typeof summary>;

// eslint-disable-next-line no-undef
export default DetectionResultSummary;
