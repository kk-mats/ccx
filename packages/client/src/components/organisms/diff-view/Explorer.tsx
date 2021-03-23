import React from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import {
	makeStyles,
	Paper,
	Typography,
	List,
	ListItem,
	ListItemText
} from "@material-ui/core";
import { TreeView, TreeItem } from "@material-ui/lab";
import { ChevronDown, ChevronRight } from "mdi-material-ui";

import ClonePairId from "common/all/types/ClonePairId";
import ClonePair from "common/all/types/ClonePair";

import useMappingResult from "hooks/useMappingResult";

import PaneWithTitle from "components/atoms/PaneWithTitle";

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

type UnifiedClonePairTreeItemProps = {
	clonePair: ClonePair;
	base: ClonePairId;
	comparing: ClonePairId[];
};

const clonePairLabel = ({ id, f1, f2 }: ClonePair): string =>
	`Ln ${f1.begin}-${f1.end - 1}/${f2.begin}-${f2.end - 1} #${id}`;

const UnifiedClonePairTreeItem: React.FunctionComponent<UnifiedClonePairTreeItemProps> = ({
	clonePair,
	base,
	comparing
}) => {
	const { result } = useMappingResult();

	const nodeId = `u${clonePair.id}`;

	return (
		<TreeItem nodeId={nodeId} label={clonePairLabel(clonePair)}>
			<TreeItem
				nodeId={`${nodeId}-b${base}`}
				label={`base: ${clonePairLabel(result.base.clonePairs[base])}`}
			/>
			<TreeItem nodeId={`${nodeId}-c`} label="comparing">
				{comparing.map((id) => (
					<TreeItem
						key={`${nodeId}-c${id}`}
						nodeId={`${nodeId}-c${id}`}
						label={clonePairLabel(result.comparing.clonePairs[id])}
					/>
				))}
			</TreeItem>
		</TreeItem>
	);
};

type ClonePairListItemProps = {
	clonePair: ClonePair;
	hash: string;
	urlBase: string;
	selected: string | null;
};

const ClonePairListItem: React.FunctionComponent<ClonePairListItemProps> = ({
	clonePair,
	hash,
	urlBase,
	selected
}) => {
	return (
		<ListItem
			button
			selected={hash === selected}
			component={Link}
			to={`${urlBase}#${hash}`}
		>
			<ListItemText primary={clonePairLabel(clonePair)} />
		</ListItem>
	);
};

type Props = {
	selected: string | null;
	baseUnmapped: ClonePairId[];
	comparingUnmapped: ClonePairId[];
	unifiedClonePairs: {
		base: ClonePairId;
		comparing: ClonePairId[];
		p: ClonePair;
	}[];
};

const Explorer: React.FunctionComponent<Props> = ({
	selected,
	baseUnmapped,
	comparingUnmapped,
	unifiedClonePairs
}) => {
	const classes = useStyles();
	const { pathname, search } = useLocation();
	const history = useHistory();
	const { result } = useMappingResult();
	const urlBase = `${pathname}${search}`;

	const onNodeSelect = React.useCallback(
		(event: React.ChangeEvent<{}>, nodeId: string) => {
			history.push(`${urlBase}#${nodeId}`);
		},
		[history, pathname, search]
	);

	return (
		<>
			<PaneWithTitle
				title={
					<Typography
						className={classes.title}
						noWrap
						variant="caption"
					>
						Mapped clone Pairs
					</Typography>
				}
			>
				<TreeView
					selected={selected || ""}
					defaultCollapseIcon={<ChevronDown />}
					defaultExpandIcon={<ChevronRight />}
					onNodeSelect={onNodeSelect}
				>
					{unifiedClonePairs.map((u) => (
						<UnifiedClonePairTreeItem
							key={u.p.id}
							clonePair={u.p}
							base={u.base}
							comparing={u.comparing}
						/>
					))}
				</TreeView>
			</PaneWithTitle>
			<PaneWithTitle
				title={
					<Typography
						className={classes.title}
						noWrap
						variant="caption"
					>
						Unmapped base clone Pairs
					</Typography>
				}
			>
				<List dense>
					{baseUnmapped.map((id) => (
						<ClonePairListItem
							key={id}
							selected={selected}
							clonePair={result.base.clonePairs[id]}
							hash={`b${id}`}
							urlBase={urlBase}
						/>
					))}
				</List>
			</PaneWithTitle>
			<PaneWithTitle
				title={
					<Typography
						className={classes.title}
						noWrap
						variant="caption"
					>
						Unmapped comparing clone Pairs
					</Typography>
				}
			>
				<List dense>
					{comparingUnmapped.map((id) => (
						<ClonePairListItem
							key={id}
							selected={selected}
							clonePair={result.comparing.clonePairs[id]}
							hash={`c${id}`}
							urlBase={urlBase}
						/>
					))}
				</List>
			</PaneWithTitle>
		</>
	);
};

export default Explorer;
