import React from "react";
import ReactSplitPane, { SplitPaneProps } from "react-split-pane";
import clsx from "clsx";

import { makeStyles, useTheme } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
	root: {
		position: "initial !important" as "initial",
		left: "initial",
		right: "initial",
		"& > *": {
			backgroundColor: theme.palette.background.paper,
			minWidth: 0
		},
		"& > .Resizer": {
			display: "block",
			flexBasis: 2,
			flex: "none",
			zIndex: 1,
			position: "static !important" as "static",
			boxSizing: "border-box",
			backgroundClip: "padding-box",
			backgroundColor: theme.palette.divider
		},
		"& > .Resizer.vertical": {
			margin: theme.spacing(0, 1),
			cursor: "col-resize"
		},
		"& > .Resizer.horizontal": {
			margin: theme.spacing(1, 0),
			cursor: "row-resize"
		}
	}
}));

type Props = SplitPaneProps;

const SplitPane: React.FunctionComponent<Props> = ({
	className,
	children,
	...rest
}) => {
	const { root } = useStyles(useTheme());

	return (
		<ReactSplitPane className={clsx([root, className])} {...rest}>
			{children}
		</ReactSplitPane>
	);
};

export default SplitPane;
