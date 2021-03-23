import * as t from "io-ts";

import { jobStarted } from "../codecs";

type JobStarted = t.TypeOf<typeof jobStarted>;

// eslint-disable-next-line no-undef
export default JobStarted;
