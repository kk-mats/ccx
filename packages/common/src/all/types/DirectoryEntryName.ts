import * as t from "io-ts";
import { directoryEntryName } from "../codecs";

type DirectoryEntryName = t.TypeOf<typeof directoryEntryName>;

// eslint-disable-next-line no-undef
export default DirectoryEntryName;
