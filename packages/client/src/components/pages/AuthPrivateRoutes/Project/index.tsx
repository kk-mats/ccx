import React from "react";
import { useParams, Route } from "react-router-dom";

import HistoriesTable from "components/molecules/HistoriesTable";
import History from "components/organisms/History";
import Diff from "components/organisms/Diff";
import { DetectionParametersConfig } from "components/pages/AuthPrivateRoutes/Project/DetectionParametersConfig";

const Projects: React.FunctionComponent = () => {
	const { project } = useParams<{ project: string }>();

	return (
		<>
			<Route exact path="/home/:project">
				<HistoriesTable project={project} />
			</Route>
			<Route exact path="/home/:project/clone-detection">
				<DetectionParametersConfig />
			</Route>
			<Route exact path="/home/:project/history">
				<HistoriesTable project={project} />
			</Route>
			<Route path="/home/:project/diff">
				<Diff project={project} />
			</Route>
			<Route path="/home/:project/history/:historyId">
				<History />
			</Route>
		</>
	);
};

export default Projects;
