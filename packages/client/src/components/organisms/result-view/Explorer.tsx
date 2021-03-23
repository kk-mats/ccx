import React from "react";
import { makeStyles, Paper, Typography } from "@material-ui/core";

import SplitPane from "components/atoms/SplitPane";
import PaneWithTitle from "components/atoms/PaneWithTitle";
import CloneIdList from "components/molecules/CloneIdList";
import CloneFileTree from "components/organisms/result-view/CloneFileTree";

const useStyles = makeStyles({
	root: {
		"& > * > *": {
			width: "100%",
			height: "100%",
			"& > *:last-child": {
				overflowY: "scroll",
				height: 0
			}
		}
	},
	cloneIdList: {
		padding: 0
	},
	title: {
		display: "inline-block",
		verticalAlign: "middle",
		width: "100%"
	}
});

type Props = {};

const Explorer: React.FunctionComponent<Props> = () => {
	const classes = useStyles();

	return (
		<SplitPane
			className={classes.root}
			allowResize
			split="horizontal"
			defaultSize="65%"
		>
			<PaneWithTitle
				title={
					<Typography
						className={classes.title}
						noWrap
						variant="caption"
					>
						Files
					</Typography>
				}
			>
				<CloneFileTree />
			</PaneWithTitle>
			<PaneWithTitle
				title={
					<Typography
						className={classes.title}
						noWrap
						variant="caption"
					>
						Clones
					</Typography>
				}
			>
				<CloneIdList className={classes.cloneIdList} />
			</PaneWithTitle>
		</SplitPane>
	);
};

export default Explorer;
