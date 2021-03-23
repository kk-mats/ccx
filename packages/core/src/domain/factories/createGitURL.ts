import * as t from "io-ts";
import { URL } from "url";

import GitURL from "common/all/types/GitURL";
import GitURLWithPassword from "domain/value-objects/GitURLWithPassword";

export default function createGitURL(value: GitURLWithPassword): GitURL {
	value.password.replace(/./, "*");
	return (value as URL) as GitURL;
}
