import * as t from "io-ts";
import { environment } from "../codecs";

type Environment = t.TypeOf<typeof environment>;

// eslint-disable-next-line no-undef
export default Environment;
