import React from "react";
import {
	TextField,
	InputBaseComponentProps,
	Button,
	InputAdornment,
	IconButton
} from "@material-ui/core";
import { Close } from "mdi-material-ui";

import { IntParameter, FloatParameter } from "common/all/types/parameters";

import { Action } from "reducers/detectionFormReducer";
import {
	DetectionFormDispatchAction,
	DetectionFormDispatchContext
} from "contexts/DetectionFormDispatchContext";

type P = {
	disabled?: boolean;
	index: number;
	value: unknown;
	error: string | undefined;
	handleChange: (next: unknown, index: number) => void;
	inputProps: InputBaseComponentProps;
	onDelete?: (index: number) => void;
};

const NumberParameterComponent: React.FunctionComponent<P> = ({
	error,
	disabled,
	value,
	index,
	handleChange,
	inputProps,
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
			inputProps={inputProps}
			// eslint-disable-next-line react/jsx-no-duplicate-props
			InputProps={InputProps}
		/>
	);
};

type Props = {
	pKey: string;
	disabled?: boolean;
	value: unknown;
	rule: (IntParameter | FloatParameter)["rule"];
	error: string | undefined | (string | undefined)[];
	dispatch: React.Dispatch<DetectionFormDispatchAction>;
};

type MProps = {
	pKey: string;
	disabled?: boolean;
	value: unknown;
	inputProps: InputBaseComponentProps;
	rule: (IntParameter | FloatParameter)["rule"];
	error: string | undefined | (string | undefined)[];
	dispatch: React.Dispatch<DetectionFormDispatchAction>;
};

const NumberParameterMultiple: React.FunctionComponent<MProps> = ({
	pKey,
	disabled,
	value,
	inputProps,
	error,
	rule,
	dispatch
}) => {
	const valueArray = React.useMemo(
		() => (Array.isArray(value) ? value : []),
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
					<NumberParameterComponent
						key={index}
						disabled={disabled}
						index={index}
						value={v}
						error={error[index]}
						handleChange={handleChange}
						inputProps={inputProps}
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
				<NumberParameterComponent
					key={index}
					disabled={disabled}
					index={index}
					value={v}
					error={index === 0 ? error : undefined}
					handleChange={handleChange}
					inputProps={inputProps}
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

type SProps = Omit<MProps, "value"> & {
	value: unknown;
};

const NumberParameterSingle: React.FunctionComponent<SProps> = ({
	pKey,
	disabled,
	value,
	inputProps,
	error,
	dispatch
}) => {
	const handleChange = React.useCallback(
		(next: unknown, index: number) => {
			dispatch({
				type: "set-parameter",
				payload: {
					key: pKey,
					value: next
				}
			});
		},
		[pKey, dispatch]
	);

	if (Array.isArray(error)) {
		return (
			<NumberParameterComponent
				disabled={disabled}
				index={0}
				value={value}
				error={error[0]}
				handleChange={handleChange}
				inputProps={inputProps}
			/>
		);
	}
	return (
		<NumberParameterComponent
			disabled={disabled}
			index={0}
			value={value}
			error={error}
			handleChange={handleChange}
			inputProps={inputProps}
		/>
	);
};

export const NumberParameterField: React.FunctionComponent<Props> = ({
	pKey,
	disabled,
	value,
	rule,
	error,
	dispatch
}) => {
	const inputProps: InputBaseComponentProps = React.useMemo(
		() => ({
			step: rule?.step
		}),
		[rule]
	);

	if (rule?.multiple) {
		return (
			<NumberParameterMultiple
				pKey={pKey}
				disabled={disabled}
				value={value}
				inputProps={inputProps}
				rule={rule}
				error={error}
				dispatch={dispatch}
			/>
		);
	}

	return (
		<NumberParameterSingle
			pKey={pKey}
			disabled={disabled}
			value={value}
			inputProps={inputProps}
			error={error}
			rule={rule}
			dispatch={dispatch}
		/>
	);
};
