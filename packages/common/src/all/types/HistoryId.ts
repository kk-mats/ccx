import * as t from "io-ts";

import { historyId } from "../codecs";

type HistoryId = t.TypeOf<typeof historyId>;

// eslint-disable-next-line no-undef
export default HistoryId;
