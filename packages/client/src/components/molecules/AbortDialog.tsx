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
import { route } from "common/auth-client/api/v1/projects/_projectName/histories/_historyId/job";

type Props = {
	project: string;
	historyId: HistoryId | null;
	onClose: () => void;
	onAbort: (historyId: HistoryId) => void;
};

const AbortDialog: React.FunctionComponent<Props> = ({
	project,
	historyId,
	onClose,
	onAbort
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
				onAbort(historyId);
			}

			onClose();
		})();
	}, [project, historyId, onAbort, onClose]);

	return (
		<Dialog open={historyId !== null} onClose={onClose}>
			<DialogTitle>Abort the clone detection job?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Do you really want to abort the detection job for
					{historyId}?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button autoFocus onClick={onClose}>
					Do not abort
				</Button>
				<Button color="secondary" onClick={onAgree}>
					Abort
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AbortDialog;
