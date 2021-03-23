import React from "react";
import SnackbarContext, { State } from "contexts/SnackbarContext";

const useSnackbar = (): State => {
	return React.useContext(SnackbarContext);
};

export default useSnackbar;
