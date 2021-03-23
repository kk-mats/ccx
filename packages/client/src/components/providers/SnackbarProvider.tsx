import React from "react";
import { Snackbar } from "@material-ui/core";
import { Alert, AlertProps } from "@material-ui/lab";

import SnackbarContext from "contexts/SnackbarContext";

type Props = {
	children: React.ReactNode;
};

const SnackbarProvider: React.FunctionComponent<Props> = (props: Props) => {
	const { children } = props;
	const [open, setOpen] = React.useState(false);
	const [content, setContent] = React.useState<{
		severity: AlertProps["severity"];
		message: string;
	}>({ severity: "success", message: "" });

	const onClose = (): void => {
		setOpen(false);
	};

	const openSnackbar = (
		severity: AlertProps["severity"],
		message: string
	): void => {
		setContent({ severity, message });
		setOpen(true);
	};

	return (
		<SnackbarContext.Provider value={{ openSnackbar }}>
			<Snackbar
				open={open}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				onClose={onClose}
			>
				<Alert
					variant="filled"
					severity={content.severity}
					onClose={onClose}
				>
					{content.message}
				</Alert>
			</Snackbar>
			{children}
		</SnackbarContext.Provider>
	);
};

export default SnackbarProvider;
