import React from "react";
import { Route, useParams } from "react-router-dom";
import useSWR from "swr";
import { Box } from "@material-ui/core";

import {
	route,
	GetResponse
} from "common/auth-client/api/v1/projects/_projectName/histories/_historyId";
import { jsonFetcher } from "utils/fetcher";
import HistoryHeader from "components/molecules/HistoryHeader";
import HistoryMain from "components/organisms/HistoryMain";
import SingleResultViewer from "components/organisms/result-view/SingleResultViewer";

const sx = { mt: 2 };

const History: React.FunctionComponent = () => {
	const { project, historyId } = useParams<{
		project: string;
		historyId: string;
	}>();
	const { data } = useSWR(
		route(project, historyId),
		jsonFetcher<GetResponse>(),
		{
			refreshInterval: 1 * 60 * 1000 // 1 min
		}
	);

	if (!data || data.error) {
		throw data;
	}

	return (
		<>
			<Route exact path="/home/:project/history/:historyId">
				<HistoryHeader
					status={data.status}
					detectorName={data.request.plugin.name}
					detectorVersion={data.request.args.detectorVersion}
					targetRevision={data.request.targets[0].revision || ""}
					targetDirectory={data.request.targets[0].directory}
					dispatched={data.dispatched}
					started={data.started}
					finished={data.finished}
				/>
				<Box mt={2}>
					<HistoryMain
						status={data.status}
						artifacts={data.artifacts}
						summaries={data.summaries.map(
							({ numberOfClonePairs }) => numberOfClonePairs
						)}
						queryString={JSON.stringify(
							data.request.args,
							undefined,
							4
						)}
					/>
				</Box>
			</Route>
			<Route path="/home/:project/history/:historyId/result/:resultId">
				<SingleResultViewer
					revision={data.request.targets[0].revision}
				/>
			</Route>
		</>
	);
};

export default History;
