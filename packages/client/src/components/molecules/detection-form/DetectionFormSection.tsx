import React from "react";
import { Box, Typography } from "@material-ui/core";

type Props = {
	title?: string;
	children: React.ReactNode;
};

const sx = {
	mt: 3,
	mb: 5
};

const DetectionFormSection: React.FunctionComponent<Props> = (props: Props) => {
	const { title, children } = props;

	return (
		<Box component="section" mt={3} mb={5}>
			{title && <Typography variant="h5">{title}</Typography>}
			{children}
		</Box>
	);
};

export default DetectionFormSection;
