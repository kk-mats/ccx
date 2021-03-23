import React from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import route from "common/auth-client/api/v1/projects/_projectName/histories/_historyId/artifacts";
import { textFetcher } from "utils/fetcher";

const Log: React.FunctionComponent = () => {
	const { project, historyId } = useParams<{
		project: string;
		historyId: string;
	}>();
	const { data } = useSWR(
		route(project, historyId, "out.log"),
		textFetcher()
	);

	if (!data) {
		throw data;
	}

	return (
		<pre>
			<code>{data}</code>
		</pre>
	);
};

export default Log;
