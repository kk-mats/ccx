import React from "react";
import {
	TextField,
	Button,
	InputAdornment,
	IconButton
} from "@material-ui/core";
import { Close } from "mdi-material-ui";

import { InputParameter } from "common/all/types/parameters";

import {
	DetectionFormDispatchContext,
	DetectionFormDispatchAction
} from "contexts/DetectionFormDispatchContext";

type P = {
	disabled?: boolean;
	index: number;
	value: unknown;
	error: string | undefined;
	handleChange: (next: unknown, index: number) => void;
	onDelete?: (index: number) => void;
};

const InputParameterComponent: React.FunctionComponent<P> = ({
	error,
	disabled,
	value,
	index,
	handleChange,
	onDelete
}) => {
	const onChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
		(event): void => {
			handleChange(event.target.value, index);
		},
		[handleChange]
	);

	const InputProps = React.useMemo(() => {
		if (index === 0 || !onDelete) {
			return undefined;
		}
		return {
			endAdornment: (
				<InputAdornment position="end">
					<IconButton onClick={() => onDelete(index)}>
						<Close />
					</IconButton>
				</InputAdornment>
			)
		};
	}, [onDelete, index]);

	return (
		<TextField
			fullWidth
			disabled={disabled}
			variant="standard"
			value={value ?? ""}
			error={!disabled && error !== undefined}
			helperText={error ?? ""}
			onChange={onChange}
			InputProps={InputProps}
		/>
	);
};

type MProps = {
	pKey: string;
	disabled?: boolean;
	value: unknown;
	rule: InputParameter["rule"];
	error: string | undefined | (string | undefined)[];
	dispatch: React.Dispatch<DetectionFormDispatchAction>;
};

const InputParameterComponentMultiple: React.FunctionComponent<MProps> = ({
	pKey,
	disabled,
	value,
	rule,
	error,
	dispatch
}) => {
	const valueArray = React.useMemo(
		() => (Array.isArray(value) ? value : [undefined]),
		[value]
	);

	const handleChange = React.useCallback(
		(next: unknown, index: number) => {
			valueArray.splice(index, 1, next);
			dispatch({
				type: "set-parameter",
				payload: {
					key: pKey,
					value: valueArray
				}
			});
		},
		[pKey, valueArray, dispatch]
	);

	const onAdd: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(() => {
		const next = rule?.default;
		dispatch({
			type: "set-parameter",
			payload: {
				key: pKey,
				value: [...valueArray, next]
			}
		});
	}, [valueArray]);

	const onDelete = React.useCallback(
		(index: number) => {
			const next = [...valueArray];
			next.splice(index, 1);
			dispatch({
				type: "set-parameter",
				payload: {
					key: pKey,
					value: next
				}
			});
		},
		[pKey, valueArray]
	);

	if (Array.isArray(error)) {
		return (
			<>
				{valueArray.map((v, index) => (
					<InputParameterComponent
						key={index}
						disabled={disabled}
						index={index}
						value={v}
						error={error[index]}
						handleChange={handleChange}
						onDelete={onDelete}
					/>
				))}
				<Button
					fullWidth
					variant="outlined"
					color="secondary"
					disabled={disabled}
					onClick={onAdd}
				>
					Add value
				</Button>
			</>
		);
	}
	return (
		<>
			{valueArray.map((v, index) => (
				<InputParameterComponent
					key={index}
					disabled={disabled}
					index={index}
					value={v}
					error={index === 0 ? error : undefined}
					handleChange={handleChange}
					onDelete={onDelete}
				/>
			))}
			<Button
				fullWidth
				variant="outlined"
				color="secondary"
				disabled={disabled}
				onClick={onAdd}
			>
				Add value
			</Button>
		</>
	);
};
type SProps = MProps;

const InputParameterComponentSingle: React.FunctionComponent<SProps> = ({
	pKey,
	disabled,
	value,
	error,
	dispatch
}) => {
	const handleChange = React.useCallback(
		(next: unknown) => {
			dispatch({
				type: "set-parameter",
				payload: {
					key: pKey,
					value: next
				}
			});
		},
		[pKey, value, dispatch]
	);

	if (Array.isArray(error)) {
		return (
			<InputParameterComponent
				disabled={disabled}
				index={0}
				value={value}
				error={error[0]}
				handleChange={handleChange}
			/>
		);
	}
	return (
		<InputParameterComponent
			disabled={disabled}
			index={0}
			value={value}
			error={error}
			handleChange={handleChange}
		/>
	);
};
type Props = {
	pKey: string;
	value: unknown;
	rule: InputParameter["rule"];
	disabled?: boolean;
	error: string | undefined | (string | undefined)[];
	dispatch: React.Dispatch<DetectionFormDispatchAction>;
};

export const InputParameterField: React.FunctionComponent<Props> = ({
	pKey,
	disabled,
	value,
	rule,
	error,
	dispatch
}) => {
	if (rule?.multiple) {
		return (
			<InputParameterComponentMultiple
				pKey={pKey}
				disabled={disabled}
				value={value}
				rule={rule}
				error={error}
				dispatch={dispatch}
			/>
		);
	}

	return (
		<InputParameterComponentSingle
			pKey={pKey}
			disabled={disabled}
			value={value}
			rule={rule}
			error={error}
			dispatch={dispatch}
		/>
	);
};
