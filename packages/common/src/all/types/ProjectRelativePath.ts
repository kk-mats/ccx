import * as t from "io-ts";
import { projectRelativePath } from "../codecs";

type ProjectRelativePath = t.TypeOf<typeof projectRelativePath>;

// eslint-disable-next-line no-undef
export default ProjectRelativePath;
