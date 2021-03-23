import * as t from "io-ts";

import { detectorName } from "../codecs";

type DetectorName = t.TypeOf<typeof detectorName>;

// eslint-disable-next-line no-undef
export default DetectorName;
