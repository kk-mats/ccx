import React from "react";
import { FormControl, Select, MenuItem } from "@material-ui/core";

import { VariantParameter } from "common/all/types/parameters";

import { Action } from "reducers/detectionFormReducer";
import { LessThanOrEqual } from "mdi-material-ui";

type Props = {
	pKey: string;
	value: unknown;
	rule: VariantParameter["rule"];
	disabled?: boolean;
	dispatch: React.Dispatch<Action>;
};

type VariantItem = {
	label: string | number;
	value: string | number;
};

const normalizeElement = (
	e: VariantParameter["rule"]["values"][number]
): VariantItem => {
	if (typeof e === "object" && "value" in e && "label" in e) {
		return e;
	}

	return {
		label: e,
		value: e
	};
};

const normalizeValues = (
	values: VariantParameter["rule"]["values"]
): VariantItem[] => values.map(normalizeElement);

export const VariantParameterField: React.FunctionComponent<Props> = React.memo(
	({ pKey, value, rule, disabled, dispatch }) => {
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
			[pKey, dispatch]
		);
		const items = React.useMemo(() => normalizeValues(rule.values), [
			rule.values
		]);

		const onChange: React.ChangeEventHandler<{
			name?: string | undefined;
			value: unknown;
		}> = React.useCallback(
			(event) => {
				handleChange(event.target.value);
			},
			[handleChange]
		);

		return (
			<FormControl fullWidth disabled={disabled}>
				<Select displayEmpty value={value ?? ""} onChange={onChange}>
					{items.map((e) => (
						<MenuItem key={e.value ?? ""} value={e.value ?? ""}>
							{e.label}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		);
	}
);
