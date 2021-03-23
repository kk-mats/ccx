import * as t from "io-ts";
import { directoryEntry } from "../codecs";

type DirectoryEntry = t.TypeOf<typeof directoryEntry>;

// eslint-disable-next-line no-undef
export default DirectoryEntry;
