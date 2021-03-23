import * as t from "io-ts";

import { detectorVersion } from "../codecs";

type DetectorVersion = t.TypeOf<typeof detectorVersion>;

// eslint-disable-next-line no-undef
export default DetectorVersion;
