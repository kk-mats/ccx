import * as t from "io-ts";
import { fileId } from "../codecs";

type FileId = t.TypeOf<typeof fileId>;

// eslint-disable-next-line no-undef
export default FileId;
