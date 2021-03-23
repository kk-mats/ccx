import React from "react";
import {
	Grid,
	Select,
	FormControl,
	InputLabel,
	MenuItem,
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	Typography,
	Box,
	makeStyles
} from "@material-ui/core";
import {
	Timeline,
	TimelineItem,
	TimelineSeparator,
	TimelineDot,
	TimelineConnector,
	TimelineContent
} from "@material-ui/lab";
import {
	SourceCommit,
	FileTree,
	HammerScrewdriver,
	OpenInNew,
	CogOutline
} from "mdi-material-ui";
import { useParams, useHistory, Link } from "react-router-dom";

import HistoryEntity from "common/all/types/HistoryEntityForClient";
import HistoryId from "common/all/types/HistoryId";

import HistoryHeaderColumn from "components/atoms/HistoryHeaderColumn";
import HistoryHeaderRow from "components/atoms/HistoryHeaderRow";

type State = {
	ids: string[];
	results: Record<string, HistoryEntity>;
	baseId: string;
	comparableResultIds: string[];
	comparingResult: string | null;
};

type Action =
	| {
			type: "change-base";
			payload: {
				resultId: string;
			};
	  }
	| {
			type: "change-comparing";
			payload: {
				resultId: string;
			};
	  };

const getComparableResults = (
	base: string,
	ids: string[],
	results: Record<string, HistoryEntity>
): string[] => {
	return ids.filter((id) => {
		if (id === base) {
			return false;
		}
		const baseTargets = results[base].request.targets;
		const comparingTargets = results[id].request.targets;
		return comparingTargets.every((t) =>
			baseTargets.some(
				(b) => b.directory === t.directory && b.revision === t.revision
			)
		);
	});
};

const getComparingResult = (comparableResults: string[]): string | null =>
	comparableResults.length > 0 ? comparableResults[0] : null;

const getInitialState = ({
	ids,
	results
}: {
	ids: string[];
	results: Record<string, HistoryEntity>;
}): State => {
	const baseId = ids[0];
	const comparableHistories = getComparableResults(baseId, ids, results);
	return {
		ids,
		results,
		baseId,
		comparableResultIds: comparableHistories,
		comparingResult: getComparingResult(comparableHistories)
	};
};
const reducer = (state: State, action: Action): State => {
	const next = { ...state };
	// eslint-disable-next-line default-case
	switch (action.type) {
		case "change-base": {
			next.baseId = action.payload.resultId;
			next.comparableResultIds = getComparableResults(
				next.baseId,
				state.ids,
				state.results
			);
			next.comparingResult = getComparingResult(next.comparableResultIds);
			break;
		}

		case "change-comparing": {
			next.comparingResult = action.payload.resultId;
			break;
		}
	}

	return next;
};

type ResultPanelProps = {
	id: string;
	results: Record<string, HistoryEntity>;
};

const ResultPanel: React.FunctionComponent<ResultPanelProps> = ({
	id,
	results
}) => {
	const [open, setOpen] = React.useState(false);

	const onClose = React.useCallback(() => setOpen(false), [setOpen]);
	const onOpen = React.useCallback(() => setOpen(true), [setOpen]);
	return (
		<Grid container>
			<HistoryHeaderColumn>
				<HistoryHeaderRow
					Icon={SourceCommit}
					title="Commit"
					body={results[id].request.targets[0].revision}
				/>
				<HistoryHeaderRow
					Icon={FileTree}
					title="Directory"
					body={results[id].request.targets[0].directory}
				/>
			</HistoryHeaderColumn>
			<HistoryHeaderColumn>
				<HistoryHeaderRow
					Icon={HammerScrewdriver}
					title="Detector"
					body={`${results[id].request.plugin.name} ${results[id].request.args.detectorVersion}`}
				/>
				<HistoryHeaderRow
					Icon={CogOutline}
					title="Parameters"
					body={
						<>
							<IconButton size="small" onClick={onOpen}>
								<OpenInNew />
							</IconButton>
							<Dialog open={open} onClose={onClose}>
								<DialogTitle>
									Parameters of {results[id].historyId}
								</DialogTitle>
								<DialogContent dividers>
									<pre>
										<code>
											{JSON.stringify(
												results[id].summaries[
													Number.parseInt(
														id.split("-")[1],
														10
													)
												].parameters,
												undefined,
												4
											)}
										</code>
									</pre>
								</DialogContent>
							</Dialog>
						</>
					}
				/>
			</HistoryHeaderColumn>
		</Grid>
	);
};

const useStyles = makeStyles({
	root: {
		"& > li::before": {
			content: "none !important"
		}
	}
});

type P = {
	ids: string[];
	results: Record<string, HistoryEntity>;
};

const SelectHistories: React.FunctionComponent<P> = ({ ids, results }) => {
	const classes = useStyles();
	const history = useHistory();
	const { project } = useParams<{ project: string }>();
	const [state, dispatch] = React.useReducer(
		reducer,
		{ ids, results },
		getInitialState
	);

	const onChange = React.useCallback(
		(
			type: Action["type"]
		): React.ChangeEventHandler<{
			value: unknown;
		}> => (event): void => {
			dispatch({
				type,
				payload: {
					resultId: event.target.value as string
				}
			});
		},
		[dispatch]
	);

	const onChangeBase: React.ChangeEventHandler<{
		value: unknown;
	}> = React.useCallback(onChange("change-base"), [onChange]);
	const onChangeComparing: React.ChangeEventHandler<{
		value: unknown;
	}> = React.useCallback(onChange("change-comparing"), [onChange]);

	const onClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(() => {
		const { revision } = results[state.baseId].request.targets[0];
		history.push(
			`/home/${project}/diff/plot?b=${state.baseId}&c=${state.comparingResult}&r=${revision}`
		);
	}, [project, state]);

	return state.comparableResultIds.length > 0 ? (
		<Timeline className={classes.root}>
			<TimelineItem>
				<TimelineSeparator>
					<TimelineDot />
					<TimelineConnector />
				</TimelineSeparator>
				<TimelineContent>
					<FormControl fullWidth>
						<InputLabel>Base</InputLabel>
						<Select value={state.baseId} onChange={onChangeBase}>
							{ids.map((id) => (
								<MenuItem key={id} value={id}>
									{id}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<ResultPanel id={state.baseId} results={state.results} />
				</TimelineContent>
			</TimelineItem>
			<TimelineItem>
				<TimelineSeparator>
					<TimelineDot />
					<TimelineConnector />
				</TimelineSeparator>
				<TimelineContent>
					<FormControl fullWidth>
						<InputLabel>Compare</InputLabel>
						<Select
							value={state.comparingResult}
							onChange={onChangeComparing}
						>
							{state.comparableResultIds.map((id) => (
								<MenuItem key={id} value={id}>
									{id}
								</MenuItem>
							))}
						</Select>
						{state.comparingResult && (
							<ResultPanel
								id={state.comparingResult}
								results={state.results}
							/>
						)}
					</FormControl>
				</TimelineContent>
			</TimelineItem>
			<TimelineItem>
				<TimelineSeparator>
					<TimelineDot />
				</TimelineSeparator>
				<TimelineContent>
					<Button
						color="secondary"
						variant="contained"
						disabled={state.comparableResultIds.length === 0}
						onClick={onClick}
					>
						Compare history
					</Button>
				</TimelineContent>
			</TimelineItem>
		</Timeline>
	) : (
		<Box m={2}>
			<Typography variant="h5">
				More than two detection history is required to compare.
			</Typography>
			<Typography variant="h6">
				<Link to={`/home/${project}/clone-detection`}>
					Detect code clones of {project}
				</Link>
			</Typography>
		</Box>
	);
};

export default SelectHistories;
