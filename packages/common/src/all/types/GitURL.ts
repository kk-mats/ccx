import * as t from "io-ts";

import { gitURL } from "../codecs";

// Secure Git URL without password
type GitURL = t.TypeOf<typeof gitURL>;

// eslint-disable-next-line no-undef
export default GitURL;
