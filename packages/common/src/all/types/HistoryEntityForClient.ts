import * as t from "io-ts";
import { historyEntityForClient } from "../codecs";

type HistoryEntityForClient = t.TypeOf<typeof historyEntityForClient>;

// eslint-disable-next-line no-undef
export default HistoryEntityForClient;
