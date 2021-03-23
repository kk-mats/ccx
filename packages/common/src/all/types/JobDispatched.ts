import * as t from "io-ts";

import { jobDispatched } from "../codecs";

type JobDispatched = t.TypeOf<typeof jobDispatched>;

// eslint-disable-next-line no-undef
export default JobDispatched;
