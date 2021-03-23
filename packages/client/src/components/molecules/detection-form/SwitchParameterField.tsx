import React from "react";
import { Switch, FormHelperText, FormControl } from "@material-ui/core";

import {
	DetectionFormDispatchAction,
	DetectionFormDispatchContext
} from "contexts/DetectionFormDispatchContext";

type Props = {
	className?: string;
	pKey: string;
	value: unknown;
	error: string | undefined | (string | undefined)[];
	disabled?: boolean;
	dispatch: React.Dispatch<DetectionFormDispatchAction>;
};

const SwitchParameterField: React.FunctionComponent<Props> = React.memo(
	({ className, pKey, value, error, disabled, dispatch }) => {
		const onChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
			(event) => {
				dispatch({
					type: "set-parameter",
					payload: {
						key: pKey,
						value: event.target.checked
					}
				});
			},
			[dispatch]
		);

		return (
			<FormControl fullWidth error={Boolean(error)}>
				<Switch
					disabled={disabled}
					className={className}
					checked={Boolean(value)}
					onChange={onChange}
				/>
				<FormHelperText>{error}</FormHelperText>
			</FormControl>
		);
	}
);

export default SwitchParameterField;
