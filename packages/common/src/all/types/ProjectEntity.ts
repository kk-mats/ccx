import * as t from "io-ts";
import { projectEntity } from "../codecs";

type ProjectEntity = t.TypeOf<typeof projectEntity>;

// eslint-disable-next-line no-undef
export default ProjectEntity;
