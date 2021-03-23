import React from "react";
import { Link } from "react-router-dom";
import {
	Card,
	CardContent,
	CardActions,
	Button,
	Typography,
	Divider,
	Grid,
	List,
	ListItem,
	ListItemIcon,
	ListItemText
} from "@material-ui/core";
import { History, Note } from "mdi-material-ui";
import useSWR from "swr";

import { route, GetResponse } from "common/auth-client/api/v1/projects";
import { jsonFetcher } from "utils/fetcher";

const ProjectList: React.FunctionComponent = () => {
	const { data } = useSWR(route(), jsonFetcher<GetResponse>());

	if (!data || data.error) {
		throw data;
	}

	return (
		<Grid container spacing={3}>
			{data.projects.map((project) => (
				<Grid key={project.name} item xs={6}>
					<Card>
						<CardContent>
							<Typography variant="h4">{project.name}</Typography>
							<List>
								<ListItem>
									{project.source.gitURL ? (
										<>
											<ListItemIcon>
												<History />
											</ListItemIcon>{" "}
											<ListItemText primary="VCS: Git" />
										</>
									) : (
										<>
											<ListItemIcon>
												<Note />
											</ListItemIcon>{" "}
											<ListItemText primary="VCS: None" />
										</>
									)}
								</ListItem>
							</List>
						</CardContent>
						<Divider />
						<CardActions>
							<Grid container justify="flex-end">
								<Grid item>
									<Button
										variant="text"
										component={Link}
										to={`/home/${project.name}`}
									>
										Open
									</Button>
								</Grid>
							</Grid>
						</CardActions>
					</Card>
				</Grid>
			))}
		</Grid>
	);
};

export default ProjectList;
