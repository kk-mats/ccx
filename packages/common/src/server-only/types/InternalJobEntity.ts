import * as t from "io-ts";
import { internalJobEntity } from "../codecs";

type InternalJobEntity = t.TypeOf<typeof internalJobEntity>;

// eslint-disable-next-line no-undef
export default InternalJobEntity;
