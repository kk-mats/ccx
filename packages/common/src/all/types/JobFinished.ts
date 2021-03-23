import * as t from "io-ts";

import { jobFinished } from "../codecs";

type JobFinished = t.TypeOf<typeof jobFinished>;

// eslint-disable-next-line no-undef
export default JobFinished;
