import * as t from "io-ts";

import { gitURLWithPassword } from "common/server-only/codecs";

type GitURLWithPassword = t.TypeOf<typeof gitURLWithPassword>;

// eslint-disable-next-line no-undef
export default GitURLWithPassword;
