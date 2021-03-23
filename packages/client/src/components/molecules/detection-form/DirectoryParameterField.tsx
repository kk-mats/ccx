import React from "react";
import { TextField } from "@material-ui/core";

import { DetectionFormDispatchAction } from "contexts/DetectionFormDispatchContext";
import { ValidateRepositoryPath } from "reducers/detectionFormReducer";

type Props = {
	pKey: string;
	value: unknown;
	revision: unknown;
	error: string | undefined | (string | undefined)[];
	project: string;
	disabled?: boolean;
	dispatch: React.Dispatch<DetectionFormDispatchAction>;
	validateRepositoryPath: ValidateRepositoryPath;
};

const DirectoryParameterField: React.FunctionComponent<Props> = React.memo(
	({
		pKey,
		value,
		revision,
		error,
		disabled,
		project,
		dispatch,
		validateRepositoryPath
	}) => {
		const [timer, setTimer] = React.useState<number>();

		const onChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
			(event) => {
				const directory = event.target.value;
				dispatch({
					type: "start-async-validation",
					payload: {
						key: pKey,
						value: directory
					}
				});

				if (timer !== undefined) {
					clearTimeout(timer);
				}
				validateRepositoryPath(
					project,
					directory,
					revision,
					setTimer,
					(res) => {
						dispatch({
							type: "finish-async-validation",
							payload: {
								key: pKey,
								error: res.directory
							}
						});
					}
				);
			},
			[pKey, dispatch, timer, project, revision, validateRepositoryPath]
		);

		return (
			<TextField
				fullWidth
				disabled={disabled}
				variant="standard"
				value={value ?? ""}
				type="string"
				error={!disabled && error !== undefined}
				helperText={error ?? ""}
				onChange={onChange}
			/>
		);
	}
);
export default DirectoryParameterField;
