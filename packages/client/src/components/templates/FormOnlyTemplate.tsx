import React from "react";
import { Typography, Container, Box, Paper } from "@material-ui/core";

type Props = {
	pageTitle: string;
	formTitle: string;
	children: React.ReactNode;
};

const sxTitle = { paddingTop: 5 };
const sxForm = { padding: 4 };
const sxFormTitle = { paddingBottom: 4 };

const FormOnlyTemplate: React.FunctionComponent<Props> = (props: Props) => {
	const { pageTitle, formTitle, children } = props;

	return (
		<Container maxWidth="sm">
			<Box pt={5}>
				<Typography gutterBottom variant="h1" align="center">
					{pageTitle}
				</Typography>
			</Box>
			<Paper>
				<Box p={6}>
					<Box paddingX={2}>
						<Typography variant="h4" component="h2" align="center">
							{formTitle}
						</Typography>
					</Box>
					<Box paddingX={4} pt={4}>
						{children}
					</Box>
				</Box>
			</Paper>
		</Container>
	);
};

export default FormOnlyTemplate;
