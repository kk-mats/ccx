import React from "react";

import { Box, useTheme, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		flexDirection: "column",
		"& > *:first-child": {
			flex: "none",
			minWidth: 0
		},
		"& > *:last-child": {
			flex: "1 1 auto"
		}
	},
	title: {
		paddingLeft: theme.spacing(1),
		width: "100%"
	}
}));

type Props = {
	title: React.ReactNode;
	children: React.ReactNode;
};

const PaneWithTitle: React.FunctionComponent<Props> = ({ title, children }) => {
	const classes = useStyles(useTheme());
	return (
		<Box className={classes.root}>
			<Box className={classes.title}>{title}</Box>
			{children}
		</Box>
	);
};

export default PaneWithTitle;
