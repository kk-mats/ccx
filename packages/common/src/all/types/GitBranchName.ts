import * as t from "io-ts";

import { gitBranchName } from "../codecs";

type GitBranchName = t.TypeOf<typeof gitBranchName>;

// eslint-disable-next-line no-undef
export default GitBranchName;
