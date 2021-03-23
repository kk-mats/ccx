import React from "react";
import { Link, useHistory } from "react-router-dom";
import {
	Button,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	IconButton
} from "@material-ui/core";
import { Pencil } from "mdi-material-ui";
import useSWR from "swr";

import { route, GetResponse } from "common/auth-client/api/v1/projects";
import { jsonFetcher } from "utils/fetcher";

type Props = {};

const ProjectsList: React.FunctionComponent<Props> = (props: Props) => {
	const history = useHistory();
	const { data } = useSWR(
		route(),
		jsonFetcher<GetResponse>(undefined, {
			403: (res) => {
				history.push("/login");
				return res;
			}
		})
	);

	if (!data || data.error) {
		return null;
	}

	return (
		<TableContainer>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>PROJECT</TableCell>
						<TableCell align="right">
							<Button
								variant="outlined"
								color="secondary"
								component={Link}
								to="/new"
							>
								Add project
							</Button>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data.projects.map((project) => (
						<TableRow
							key={project.name}
							hover
							onClick={(): void => {
								history.push(`/home/${project.name}`);
							}}
						>
							<TableCell>{project.name}</TableCell>
							<TableCell align="right">
								<IconButton>
									<Pencil />
								</IconButton>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default ProjectsList;
