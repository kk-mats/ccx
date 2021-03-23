import React from "react";
import { Link, useParams } from "react-router-dom";
import {
	Tabs,
	Tab,
	Paper,
	Box,
	Button,
	Divider,
	Typography
} from "@material-ui/core";

import JobStatus from "common/all/types/JobStatus";
import Artifact from "common/all/types/Artifact";
import ArtifactsTable from "components/molecules/ArtifactsTable";
import Log from "components/molecules/Log";

type TabPanelProps = {
	value: unknown;
	index: unknown;
	children: React.ReactNode;
};

// eslint-disable-next-line react/display-name
const TabPanel: React.FunctionComponent<TabPanelProps> = React.memo(
	({ value, index, children }) => (
		<div hidden={value !== index}>{children}</div>
	)
);

type Props = {
	status: JobStatus;
	artifacts: Artifact[];
	summaries: number[];
	queryString: string;
};

const sx = { p: 2 };

const HistoryMain: React.FunctionComponent<Props> = (props: Props) => {
	const { status, artifacts, summaries, queryString } = props;
	const { project, historyId } = useParams<{
		project: string;
		historyId: string;
	}>();
	const [value, setValue] = React.useState(status === "Succeeded" ? 0 : 3);

	const onChange = React.useCallback(
		(event: React.ChangeEvent<{}>, newValue: number): void => {
			setValue(newValue);
		},
		[setValue]
	);

	const tabs = React.useMemo(() => {
		const elements = [];
		if (status === "Succeeded") {
			elements.push(<Tab key="summary" label="Summary" value={0} />);
			elements.push(<Tab key="log" label="Log" value={1} />);
			elements.push(<Tab key="artifacts" label="Artifacts" value={2} />);
		} else if (status === "Failed") {
			elements.push(<Tab key="log" label="Log" value={1} />);
			elements.push(<Tab key="artifacts" label="Artifacts" value={2} />);
		}
		elements.push(<Tab key="query" label="Query" value={3} />);
		return elements;
	}, [status]);

	return (
		<Paper square>
			<Tabs value={value} onChange={onChange}>
				{tabs}
			</Tabs>
			<Divider />
			<Box p={2}>
				<TabPanel value={value} index={0}>
					{summaries.map((summary, index) => (
						<div key={`summary-${index}`}>
							<Typography>
								Number of Clone Pairs:
								{summary.toLocaleString()}
							</Typography>
							<Button
								disabled={summary === 0}
								color="secondary"
								variant="contained"
								component={Link}
								to={`/home/${project}/history/${historyId}/result/${index}`}
							>
								View Result
							</Button>
						</div>
					))}
				</TabPanel>
				<TabPanel value={value} index={1}>
					{(status === "Succeeded" || status === "Failed") && <Log />}
				</TabPanel>
				<TabPanel value={value} index={2}>
					<ArtifactsTable files={artifacts} />
				</TabPanel>
				<TabPanel value={value} index={3}>
					<pre>
						<code>{queryString}</code>
					</pre>
				</TabPanel>
			</Box>
		</Paper>
	);
};

export default HistoryMain;
