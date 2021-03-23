import React from "react";
import { Theme, useTheme, makeStyles, createStyles } from "@material-ui/core";

import AppMenuBar from "components/organisms/AppMenuBar";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: "flex"
		},
		content: {
			flexGrow: 1,
			padding: theme.spacing(3)
		},
		toolbar: theme.mixins.toolbar
	})
);

type Props = {
	children: React.ReactNode;
};

const AppBarTemplate: React.FunctionComponent<Props> = (props: Props) => {
	const { children } = props;
	const classes = useStyles(useTheme());

	return (
		<div className={classes.root}>
			<AppMenuBar />
			<main className={classes.content}>
				<div className={classes.toolbar} />
				{children}
			</main>
		</div>
	);
};

export default AppBarTemplate;
