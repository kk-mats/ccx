import React from "react";
import { Checkbox, ListItemText, ListItemIcon } from "@material-ui/core";

import { OptionalParameter } from "common/all/types/parameters";

import DirectoryParameterField from "components/molecules/detection-form/DirectoryParameterField";
import { DetectionFormDispatchAction } from "contexts/DetectionFormDispatchContext";
import { NumberParameterField } from "components/molecules/detection-form/NumberParameterField";
import { VariantParameterField } from "components/molecules/detection-form/VariantParameterField";
import { InputParameterField } from "components/molecules/detection-form/InputParameterField";
import { ValidateRepositoryPath } from "utils/validateRepositoryPath";

type Props = {
	pKey: string;
	value: unknown;
	def: OptionalParameter;
	values: Record<string, unknown>;
	error: string | undefined | (string | undefined)[];
	project: string;
	dispatch: React.Dispatch<DetectionFormDispatchAction>;
	validateRepositoryPath: ValidateRepositoryPath;
};

export const OptionalParameterField: React.FunctionComponent<Props> = ({
	pKey,
	value,
	def,
	values,
	error,
	project,
	dispatch,
	validateRepositoryPath
}) => {
	const { rule } = def;

	const [enabledValue, setEnabledValue] = React.useState<unknown>(
		def.rule.rule?.default ?? undefined
	);

	React.useEffect(() => {
		if (value !== null) {
			setEnabledValue(value);
		}
	}, [value, setEnabledValue]);

	const onCheckboxChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
		(event) => {
			if (!event.target.checked) {
				setEnabledValue(value);
				dispatch({
					type: "set-parameter",
					payload: {
						key: pKey,
						value: null
					}
				});
			} else {
				dispatch({
					type: "set-parameter",
					payload: {
						key: pKey,
						value: enabledValue ?? undefined
					}
				});
			}
		},
		[enabledValue, setEnabledValue]
	);

	const render = React.useMemo(() => {
		switch (rule.type) {
			case "variant": {
				return (
					v: unknown,
					enabled: unknown,
					err: string | undefined | (string | undefined)[]
				) => (
					<VariantParameterField
						pKey={pKey}
						disabled={v === null}
						value={v ?? enabled}
						rule={rule.rule}
						dispatch={dispatch}
					/>
				);
			}
			case "input": {
				return (
					v: unknown,
					enabled: unknown,
					err: string | undefined | (string | undefined)[]
				) => (
					<InputParameterField
						pKey={pKey}
						disabled={v === null}
						value={v ?? enabled}
						rule={rule.rule}
						error={err}
						dispatch={dispatch}
					/>
				);
			}

			// type==="int" || type==="float"
			case "int":
			case "float": {
				return (
					v: unknown,
					enabled: unknown,
					err: string | undefined | (string | undefined)[]
				) => (
					<NumberParameterField
						pKey={pKey}
						disabled={v === null}
						value={v ?? enabled}
						rule={rule.rule}
						error={err}
						dispatch={dispatch}
					/>
				);
			}

			case "directory": {
				return (
					v: unknown,
					enabled: unknown,
					err: string | undefined | (string | undefined)[]
				) => (
					<DirectoryParameterField
						pKey={pKey}
						disabled={v === null}
						value={v ?? enabled}
						revision={values[rule.rule.revision]}
						error={err}
						project={project}
						dispatch={dispatch}
						validateRepositoryPath={validateRepositoryPath}
					/>
				);
			}

			default: {
				return () => null;
			}
		}
	}, [value, pKey]);

	return (
		<>
			<ListItemIcon>
				<Checkbox
					edge="start"
					checked={value !== null}
					onChange={onCheckboxChange}
					tabIndex={-1}
					disableRipple
				/>
			</ListItemIcon>
			<ListItemText
				disableTypography
				primary={def.label ?? pKey}
				secondary={render(value, enabledValue, error)}
			/>
		</>
	);
};
