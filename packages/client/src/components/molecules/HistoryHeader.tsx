import React from "react";
import { Paper, Grid, Box } from "@material-ui/core";
import {
	SourceCommit,
	SourceBranch,
	FileTree,
	HammerScrewdriver,
	Timelapse,
	CalendarPlus,
	CalendarCheck
} from "mdi-material-ui";

import JobStatusType from "common/all/types/JobStatus";
import { PluginName } from "common/all/types/plugin";
import DetectorVersion from "common/all/types/DetectorVersion";
import ProjectRelativePath from "common/all/types/ProjectRelativePath";

import formatDate from "utils/formatDate";

import JobStatus from "components/atoms/JobStatus";
import HistoryHeaderColumn from "components/atoms/HistoryHeaderColumn";
import HistoryHeaderRow from "components/atoms/HistoryHeaderRow";

type Props = {
	status: JobStatusType;
	detectorName: PluginName;
	detectorVersion: DetectorVersion;
	targetRevision: string;
	targetDirectory: ProjectRelativePath;
	dispatched: string;
	started?: string;
	finished?: string;
};

const SEC_IN_MS = 1000;
const MIN_IN_SEC = 60;
const HOUR_IN_MIN = 60;

const padNum = (num: number): string => num.toString().padStart(2, "0");

const durationToString = (
	started: Date,
	finished: Date
): string | undefined => {
	const ms = finished.getTime() - started.getTime();
	if (ms < SEC_IN_MS) {
		return `< 1s`;
	}

	let sec = Math.floor(ms / SEC_IN_MS);
	if (sec < MIN_IN_SEC) {
		return `00:00:${padNum(sec)}`;
	}

	let min = Math.floor(sec / MIN_IN_SEC);
	sec -= min * MIN_IN_SEC;
	if (min < HOUR_IN_MIN) {
		return `00:${padNum(min)}:${padNum(sec)}`;
	}

	const hour = Math.floor(min / HOUR_IN_MIN);
	min -= hour * HOUR_IN_MIN;
	return `${padNum(hour)}:${padNum(min)}:${padNum(sec)}`;
};

const sx = { marginTop: 2, mx: 2 };

const HistoryHeader: React.FunctionComponent<Props> = (props: Props) => {
	const {
		status,
		detectorName,
		detectorVersion,
		targetRevision,
		targetDirectory,
		dispatched,
		started,
		finished
	} = props;

	const { dispatchedDate, startedDate, finishedDate } = React.useMemo(
		() => ({
			dispatchedDate: new Date(dispatched),
			startedDate: started && new Date(started),
			finishedDate: finished && new Date(finished)
		}),
		[dispatched, started, finished]
	);

	const duration = React.useMemo(() => {
		if (startedDate && finishedDate) {
			return durationToString(startedDate, finishedDate);
		}
		return undefined;
	}, [startedDate, finishedDate]);

	return (
		<Paper square variant="outlined">
			<Box mt={2} mx={2}>
				<JobStatus status={status} />
			</Box>
			<Grid container>
				<HistoryHeaderColumn>
					<HistoryHeaderRow
						Icon={SourceCommit}
						title="Commit"
						body={targetRevision}
					/>
					{/* <HistoryHeaderRow Icon={SourceBranch} title="Branch" body={targetDirectory} /> */}
					<HistoryHeaderRow
						Icon={FileTree}
						title="Directory"
						body={
							targetDirectory === "." ? "<root>" : targetDirectory
						}
					/>
				</HistoryHeaderColumn>

				<HistoryHeaderColumn>
					<HistoryHeaderRow
						Icon={HammerScrewdriver}
						title="Detector"
						body={`${detectorName} ${detectorVersion}`}
					/>
				</HistoryHeaderColumn>

				<HistoryHeaderColumn>
					{duration && (
						<HistoryHeaderRow
							Icon={Timelapse}
							title="Duration"
							body={duration}
						/>
					)}
					<HistoryHeaderRow
						Icon={CalendarPlus}
						title="Dispatched"
						body={formatDate(dispatchedDate)}
					/>
					{finishedDate && (
						<HistoryHeaderRow
							Icon={CalendarCheck}
							title="Finished"
							body={formatDate(finishedDate)}
						/>
					)}
				</HistoryHeaderColumn>
			</Grid>
		</Paper>
	);
};

export default HistoryHeader;
