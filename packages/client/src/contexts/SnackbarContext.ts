import React from "react";

import { AlertProps } from "@material-ui/lab";

export type State = {
	openSnackbar: (
		severity: AlertProps["severity"],
		message: string,
		duration?: number
	) => void;
};

const SnackbarContext = React.createContext<State>({
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	openSnackbar: (): void => {}
});

export default SnackbarContext;
