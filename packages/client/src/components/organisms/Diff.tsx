import React from "react";
import { useHistory, Route, Link } from "react-router-dom";
import useSWR from "swr";
import { Typography, Box } from "@material-ui/core";
import { jsonFetcher } from "utils/fetcher";
import {
	route,
	GetResponse
} from "common/auth-client/api/v1/projects/_projectName/histories";

import MappingResultProvider from "components/providers/MappingResultProvider";

import SelectHistories from "components/organisms/diff-view/SelectHistories";
import DiffPlot from "components/organisms/diff-view/DiffPlot";
import DiffView from "components/organisms/diff-view/DiffView";
import HistoryId from "common/all/types/HistoryId";
import HistoryEntityForClient from "common/all/types/HistoryEntityForClient";

type Props = {
	project: string;
};

const Diff: React.FunctionComponent<Props> = (props: Props) => {
	const { project } = props;
	const history = useHistory();
	const { data } = useSWR(
		route(project),
		jsonFetcher<GetResponse>(undefined, {
			403: (res) => {
				history.push("/login");
				return res;
			}
		})
	);

	if (!data || data.error) {
		throw data;
	}

	const [ids, results] = React.useMemo(
		() => {
			const resultIds: string[] = [];
			const histories: Record<string, HistoryEntityForClient> = {};
			data.histories.forEach((h) => {
				if (h.status === "Succeeded") {
					h.summaries?.forEach((s) => {
						const id = `${h.historyId}-${s.id}`;
						resultIds.push(id);
						histories[id] = h;
					});
				}
			});

			return [resultIds, histories];
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[project]
	);

	return ids.length > 0 ? (
		<>
			<Route exact path="/home/:project/diff">
				<SelectHistories ids={ids} results={results} />
			</Route>
			<Route path="/home/:project/diff/">
				<MappingResultProvider>
					<Route exact path="/home/:project/diff/plot">
						<DiffPlot project={project} />
					</Route>
					<Route exact path="/home/:project/diff/view">
						<DiffView project={project} />
					</Route>
				</MappingResultProvider>
			</Route>
		</>
	) : (
		<Box m={2}>
			<Typography variant="h5">No history</Typography>
			<Typography variant="h6">
				<Link to={`/home/${project}/clone-detection`}>
					Detect code clones of {project}
				</Link>
			</Typography>
		</Box>
	);
};

export default Diff;
