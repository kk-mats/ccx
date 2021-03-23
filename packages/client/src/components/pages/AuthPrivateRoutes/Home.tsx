import React from "react";
import { Link, Route } from "react-router-dom";

import ProjectsList from "components/molecules/ProjectsList";
import AppBarTemplate from "components/templates/AppBarTemplate";
import ProjectTemplate from "components/templates/ProjectTemplate";
import Project from "components/pages/AuthPrivateRoutes/Project";

const Home: React.FunctionComponent = () => {
	return (
		<>
			<Route exact path="/home">
				<AppBarTemplate>
					<ProjectsList />
				</AppBarTemplate>
			</Route>
			<Route path="/home/:project">
				<ProjectTemplate>
					<Project />
				</ProjectTemplate>
			</Route>
		</>
	);
};

export default Home;
