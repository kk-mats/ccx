import React from "react";
import { TextField } from "@material-ui/core";

import { DetectionFormDispatchAction } from "contexts/DetectionFormDispatchContext";
import { ValidateRepositoryPath } from "reducers/detectionFormReducer";

type Props = {
	pKey: string;
	value: unknown;
	disabled?: boolean;
	project: string;
	error: string | undefined | (string | undefined)[];
	dispatch: React.Dispatch<DetectionFormDispatchAction>;
	validateRepositoryPath: ValidateRepositoryPath;
};

const RevisionParameterField: React.FunctionComponent<Props> = React.memo(
	({
		project,
		pKey,
		value,
		disabled,
		error,
		dispatch,
		validateRepositoryPath
	}) => {
		const [timer, setTimer] = React.useState<number>();

		const onChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
			(event) => {
				const revision = event.target.value;
				dispatch({
					type: "start-async-validation",
					payload: {
						key: pKey,
						value: revision
					}
				});

				if (timer !== undefined) {
					clearTimeout(timer);
				}
				validateRepositoryPath(
					project,
					undefined,
					revision,
					setTimer,
					(res) => {
						dispatch({
							type: "finish-async-validation",
							payload: {
								key: pKey,
								error: res.revision
							}
						});
					}
				);
			},
			[pKey, dispatch, timer, project, validateRepositoryPath]
		);

		return (
			<TextField
				fullWidth
				disabled={disabled}
				variant="standard"
				value={value ?? ""}
				type="string"
				error={error !== undefined}
				helperText={error ?? ""}
				onChange={onChange}
			/>
		);
	}
);

export default RevisionParameterField;
