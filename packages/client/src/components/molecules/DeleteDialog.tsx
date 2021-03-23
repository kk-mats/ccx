import React from "react";
import {
	Button,
	Dialog,
	DialogContent,
	DialogActions,
	DialogContentText,
	DialogTitle
} from "@material-ui/core";

import api from "utils/api";

import HistoryId from "common/all/types/HistoryId";
import { route } from "common/auth-client/api/v1/projects/_projectName/histories/_historyId";

type Props = {
	project: string;
	historyId: HistoryId | null;
	onClose: () => void;
	onDelete: (historyId: HistoryId) => void;
};

const DeleteDialog: React.FunctionComponent<Props> = ({
	project,
	historyId,
	onClose,
	onDelete
}) => {
	const onAgree = React.useCallback(() => {
		if (historyId === null) {
			return;
		}
		(async () => {
			const res = await api.delete(route(project, historyId), {
				throwHttpErrors: false
			});

			if (res.status === 200) {
				onDelete(historyId);
			}

			onClose();
		})();
	}, [project, historyId, onDelete, onClose]);

	return (
		<Dialog open={historyId !== null} onClose={onClose}>
			<DialogTitle>Delete history?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Do you really want to delete history {historyId}?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button autoFocus onClick={onClose}>
					Do not delete
				</Button>
				<Button color="secondary" onClick={onAgree}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DeleteDialog;
