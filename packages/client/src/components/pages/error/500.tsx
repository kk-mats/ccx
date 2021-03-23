import React from "react";
import { Container, Box, Typography } from "@material-ui/core";

const ServerError: React.FunctionComponent = () => (
	<Container>
		<Box>
			<Typography component="h1" variant="h3">
				500
			</Typography>
			<Typography component="h2" variant="h1">
				Server Error
			</Typography>
		</Box>
	</Container>
);

export default ServerError;
