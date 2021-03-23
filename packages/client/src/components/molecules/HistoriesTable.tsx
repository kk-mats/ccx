import React from "react";
import { Link, useHistory } from "react-router-dom";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon
} from "@material-ui/core";
import {
	CloudDownload,
	StopCircleOutline,
	DotsVertical,
	Delete
} from "mdi-material-ui";
import useSWR from "swr";

import HistoryId from "common/all/types/HistoryId";
import HistoryEntityForClient from "common/all/types/HistoryEntityForClient";

import {
	route,
	GetResponse
} from "common/auth-client/api/v1/projects/_projectName/histories";
import { jsonFetcher } from "utils/fetcher";
import formatDate from "utils/formatDate";

import AbortDialog from "components/molecules/AbortDialog";
import DeleteDialog from "components/molecules/DeleteDialog";

type Props = {
	project: string;
};

type RowProps = {
	project: string;
	history: HistoryEntityForClient;
	onAbortOpen: (deleted: HistoryId) => void;
	onDeleteOpen: (deleted: HistoryId) => void;
};

const HistoryRow: React.FunctionComponent<RowProps> = ({
	project,
	history,
	onAbortOpen,
	onDeleteOpen
}) => {
	const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
	const onMenuClick = React.useCallback<React.MouseEventHandler<HTMLElement>>(
		(event) => setAnchor(event.currentTarget),
		[setAnchor]
	);
	const onMenuClose = React.useCallback(() => setAnchor(null), [setAnchor]);
	const handleAbortOpen = React.useCallback(
		() => onAbortOpen(history.historyId),
		[history, onAbortOpen]
	);
	const handleDeleteOpen = React.useCallback(
		() => onDeleteOpen(history.historyId),
		[history, onDeleteOpen]
	);

	const menuItems = React.useMemo(() => {
		const items: React.ReactNodeArray = [];

		if (history.status === "Succeeded") {
			items.push(
				<MenuItem
					key="download"
					dense
					download
					component="a"
					href={`${process.env.URL_BASE}api/projects/${project}/histories/${history.historyId}/artifacts/${history.historyId}.zip`}
					onClick={onMenuClose}
				>
					<ListItemIcon>
						<CloudDownload />
					</ListItemIcon>
					Download artifacts
				</MenuItem>
			);
		} else if (history.status !== "Failed") {
			items.push(
				<MenuItem key="abort" dense onClick={handleAbortOpen}>
					<ListItemIcon>
						<StopCircleOutline />
					</ListItemIcon>
					Abort the detection job
				</MenuItem>
			);
		}
		items.push(
			<MenuItem key="delete" dense onClick={handleDeleteOpen}>
				<ListItemIcon>
					<Delete />
				</ListItemIcon>
				Delete
			</MenuItem>
		);

		return items;
	}, [history, project, onMenuClose, handleAbortOpen, handleDeleteOpen]);

	return (
		<TableRow>
			<TableCell>{history.status}</TableCell>
			<TableCell>
				<Link to={`/home/${project}/history/${history.historyId}`}>
					{history.historyId}
				</Link>
			</TableCell>
			<TableCell>
				{`${history.request.plugin.name} ${history.request.args.detectorVersion}`}
			</TableCell>
			<TableCell>{formatDate(new Date(history.dispatched))}</TableCell>
			<TableCell>{history.request.targets[0].revision || ""}</TableCell>
			<TableCell>
				<IconButton onClick={onMenuClick}>
					<DotsVertical />
				</IconButton>
				<Menu
					keepMounted
					variant="menu"
					open={Boolean(anchor)}
					anchorEl={anchor}
					onClose={onMenuClose}
				>
					{menuItems}
				</Menu>
			</TableCell>
		</TableRow>
	);
};

const HistoriesTable: React.FunctionComponent<Props> = (props: Props) => {
	const { project } = props;
	const history = useHistory();
	const { data, mutate } = useSWR(
		route(project),
		jsonFetcher<GetResponse>(undefined, {
			403: (res) => {
				history.push("/login");
				return res;
			}
		})
	);

	const [
		abortHistoryId,
		setAbortHistoryId
	] = React.useState<HistoryId | null>(null);
	const onAbortOpen = React.useCallback(
		(historyId: HistoryId) => setAbortHistoryId(historyId),
		[setAbortHistoryId]
	);
	const onAbortClose = React.useCallback(() => setAbortHistoryId(null), [
		setAbortHistoryId
	]);
	const onAbort = React.useCallback(
		(aborted: HistoryId) => {
			if (!data || data.error) {
				return;
			}
			const index = data.histories.findIndex(
				({ historyId }) => historyId === aborted
			);

			if (index >= 0) {
				const next = [...data.histories];
				next[index].status = "Failed";
				mutate({
					histories: next
				});
			}
		},
		[data, mutate]
	);

	const [
		deleteHistoryId,
		setDeleteHistoryId
	] = React.useState<HistoryId | null>(null);
	const onDeleteOpen = React.useCallback(
		(historyId: HistoryId) => setDeleteHistoryId(historyId),
		[setDeleteHistoryId]
	);
	const onDeleteClose = React.useCallback(() => setDeleteHistoryId(null), [
		setDeleteHistoryId
	]);
	const onDelete = (deleted: HistoryId) => {
		if (!data || data.error) {
			return;
		}

		const index = data.histories.findIndex(
			({ historyId }) => historyId === deleted
		);

		if (index >= 0) {
			mutate({
				histories: data.histories
					.slice(0, index)
					.concat(data.histories.slice(index + 1))
			});
		}
	};

	if (!data || data.error) {
		return null;
	}

	return (
		<>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Status</TableCell>
						<TableCell>History ID</TableCell>
						<TableCell>Detector</TableCell>
						<TableCell>Date</TableCell>
						<TableCell>Revision</TableCell>
						<TableCell align="right" />
					</TableRow>
				</TableHead>
				<TableBody>
					{data.histories.map((h) => (
						<HistoryRow
							key={h.historyId}
							history={h}
							project={project}
							onAbortOpen={onAbortOpen}
							onDeleteOpen={onDeleteOpen}
						/>
					))}
				</TableBody>
			</Table>
			<AbortDialog
				project={project}
				historyId={abortHistoryId}
				onClose={onAbortClose}
				onAbort={onAbort}
			/>
			<DeleteDialog
				project={project}
				historyId={deleteHistoryId}
				onClose={onDeleteClose}
				onDelete={onDelete}
			/>
		</>
	);
};

export default HistoriesTable;
