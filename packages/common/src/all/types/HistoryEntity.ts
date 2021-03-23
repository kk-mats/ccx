import * as t from "io-ts";
import { historyEntity } from "../codecs";

type HistoryEntity = t.TypeOf<typeof historyEntity>;

// eslint-disable-next-line no-undef
export default HistoryEntity;
