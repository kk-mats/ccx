import * as t from "io-ts";

import { gitCommitSHA } from "../codecs";

type GitCommitSHA = t.TypeOf<typeof gitCommitSHA>;
// eslint-disable-next-line no-undef
export default GitCommitSHA;
