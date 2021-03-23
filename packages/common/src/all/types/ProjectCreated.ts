import * as t from "io-ts";

import { projectCreated } from "../codecs";

type ProjectCreated = t.TypeOf<typeof projectCreated>;

// eslint-disable-next-line no-undef
export default ProjectCreated;
