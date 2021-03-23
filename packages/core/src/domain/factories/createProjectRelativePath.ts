import * as t from "io-ts";
import { projectRelativePath } from "common/all/codecs";

type ProjectRelativePath = t.TypeOf<typeof projectRelativePath>;

function createProjectRelativePath(value: string): ProjectRelativePath {
	return value as ProjectRelativePath;
}

// eslint-disable-next-line no-undef
export default createProjectRelativePath;
