import * as t from "io-ts";

import { jobStatus } from "../codecs";

type JobStatus = t.TypeOf<typeof jobStatus>;

// eslint-disable-next-line no-undef
export default JobStatus;
