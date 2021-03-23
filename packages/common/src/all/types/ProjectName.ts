import * as t from "io-ts";

import { projectName } from "../codecs";

type ProjectName = t.TypeOf<typeof projectName>;

// eslint-disable-next-line no-undef
export default ProjectName;
