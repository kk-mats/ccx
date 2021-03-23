import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { makeStyles, Typography, Tooltip } from "@material-ui/core";

import ClonePairId from "common/all/types/ClonePairId";

import useSingleResult from "hooks/useSingleResult";

import SplitPane from "components/atoms/SplitPane";
import BaseCloneView from "components/organisms/result-view/BaseCloneView";
import PairedCloneView from "components/organisms/result-view/PairedCloneView";
import PaneWithTitle from "components/atoms/PaneWithTitle";

const useStyles = makeStyles({
	root: {
		"& > * > *": {
			width: "100%",
			height: "100%",
			"& > *:last-child": {
				height: 0
			}
		}
	},
	clone: {
		backgroundColor: "#f7e6ff", // light purple
		width: "5px !important",
		marginLeft: "5px"
	},
	selectedClone: {
		backgroundColor: "#bb3dff", // purple
		width: "7px !important",
		marginLeft: "4px"
	},
	title: {
		display: "inline-block",
		verticalAlign: "middle",
		width: "100%"
	}
});

type Props = {
	revision: string;
};

const CloneView: React.FunctionComponent<Props> = ({ revision }) => {
	const { hash } = useLocation();
	const { project, historyId, resultId } = useParams<
		Record<"project" | "historyId" | "resultId", string>
	>();
	const classes = useStyles();

	const [result] = useSingleResult();

	const [selected, setSelected] = React.useState<ClonePairId | null>(null);
	const [paired, setPaired] = React.useState<{
		path: string;
		begin: number;
		end: number;
	} | null>(null);

	React.useEffect(() => {
		if (hash.startsWith("#")) {
			const id = Number(hash.split("#")[1]) as ClonePairId;
			if (id in result.biased) {
				setSelected(id);
				const { file, ...rest } = result.biased[id].paired;
				setPaired({
					...rest,
					path: result.normalized.files[file].path
				});
				return;
			}
		}
		setSelected(null);
		setPaired(null);
	}, [hash, setPaired, setSelected, result]);

	return (
		<SplitPane
			className={classes.root}
			split="vertical"
			minSize={250}
			defaultSize="50%"
		>
			<PaneWithTitle
				title={
					<Tooltip title={result.base.path}>
						<Typography
							className={classes.title}
							noWrap
							variant="caption"
						>
							{result.base.path}
						</Typography>
					</Tooltip>
				}
			>
				<BaseCloneView
					revision={revision}
					selected={selected}
					classes={classes}
				/>
			</PaneWithTitle>
			<React.Suspense fallback="loading">
				<PaneWithTitle
					title={
						paired?.path ? (
							<Link
								to={`/home/${project}/history/${historyId}/result/${resultId}/${
									paired.path
								}${selected === null ? "" : `#${selected}`}`}
							>
								<Tooltip
									title={`Open in the left pane: ${paired.path}`}
								>
									<Typography
										className={classes.title}
										noWrap
										variant="caption"
									>
										{paired?.path}
									</Typography>
								</Tooltip>
							</Link>
						) : (
							<></>
						)
					}
				>
					<PairedCloneView
						project={project}
						revision={revision}
						paired={paired}
					/>
				</PaneWithTitle>
			</React.Suspense>
		</SplitPane>
	);
};

export default CloneView;
