import React from "react";
import { Tooltip, Typography, makeStyles } from "@material-ui/core";

import ClonePair from "common/all/types/ClonePair";
import ClonePairId from "common/all/types/ClonePairId";

import SplitPane from "components/atoms/SplitPane";
import PaneWithTitle from "components/atoms/PaneWithTitle";
import DiffCloneView from "components/organisms/diff-view/DiffCloneView";
import useMappingResult from "hooks/useMappingResult";

const useStyles = makeStyles({
	root: {
		height: "100%",
		"& > div > div": {
			height: "100%"
		}
	}
});

type Props = {
	project: string;
	x: number;
	y: number;
	selected: string | null;
	baseUnmapped: ClonePairId[];
	comparingUnmapped: ClonePairId[];
	unifiedClonePairs: {
		base: ClonePairId;
		comparing: ClonePairId[];
		p: ClonePair;
	}[];
};

const DiffClonePairView: React.FunctionComponent<Props> = ({
	project,
	x,
	y,
	selected,
	baseUnmapped,
	comparingUnmapped,
	unifiedClonePairs
}) => {
	const classes = useStyles();
	const { result } = useMappingResult();

	return (
		<SplitPane
			className={classes.root}
			split="vertical"
			minSize={250}
			defaultSize="50%"
		>
			<PaneWithTitle
				title={
					<Tooltip title={result.allFiles[x].path}>
						<Typography noWrap variant="caption">
							{result.allFiles[x].path}
						</Typography>
					</Tooltip>
				}
			>
				<DiffCloneView
					project={project}
					selected={selected}
					path={result.allFiles[x].path}
					orientation="left"
					baseUnmapped={baseUnmapped}
					comparingUnmapped={comparingUnmapped}
					unifiedClonePairs={unifiedClonePairs}
				/>
			</PaneWithTitle>
			<PaneWithTitle
				title={
					<Tooltip title={result.allFiles[y].path}>
						<Typography noWrap variant="caption">
							{result.allFiles[y].path}
						</Typography>
					</Tooltip>
				}
			>
				<DiffCloneView
					project={project}
					selected={selected}
					path={result.allFiles[y].path}
					orientation="right"
					baseUnmapped={baseUnmapped}
					comparingUnmapped={comparingUnmapped}
					unifiedClonePairs={unifiedClonePairs}
				/>
			</PaneWithTitle>
		</SplitPane>
	);
};

export default DiffClonePairView;
