import { Validate } from "io-ts";
import {
	VariantParameter,
	IntParameter,
	FloatParameter,
	InputParameter,
	SwitchParameter,
	OptionalParameter,
	DetectionParameterDef,
	DirectoryParameter,
	RevisionParameter
} from "../types/parameters";

export type ValidationResult = {
	value: unknown;
	valueLabel: unknown;
	error?: string;
};

const validateNumberParameter = (
	value: number,
	rule: IntParameter["rule"] | FloatParameter["rule"]
): ValidationResult => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};

	if (!rule) {
		return r;
	}

	if (rule.min !== undefined && value < rule.min) {
		r.error = `This field must be greater than or equal to ${rule.min}.`;
	} else if (rule.minExclusive !== undefined && value <= rule.minExclusive) {
		r.error = `This field must be greater than ${rule.min}.`;
	} else if (rule.max !== undefined && rule.max < value) {
		r.error = `This field must be smaller than or equal to ${rule.max}`;
	} else if (rule.maxExclusive !== undefined && rule.maxExclusive <= value) {
		r.error = `This field must be smaller than ${rule.max}`;
	}
	return r;
};

export const validateIntParameterSingle = (
	value: unknown,
	rule: IntParameter["rule"]
): ValidationResult => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};
	if (value === undefined || value === "") {
		if (rule?.sync) {
			return r;
		}
		r.error = "this field is required.";
	} else if (typeof value === "string") {
		if (/^[-+]?(\d+)$/.test(value)) {
			return validateNumberParameter(Number.parseInt(value, 10), rule);
		}
	} else if (typeof value === "number") {
		return validateNumberParameter(value, rule);
	}
	return {
		value,
		valueLabel: value,
		error: "This field must be an integer."
	};
};

export const validateIntParameter = (
	value: unknown,
	rule: IntParameter["rule"],
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>
): ValidationResult | ValidationResult[] => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};

	if (value === undefined || value === "") {
		if (rule?.sync) {
			return r;
		}
		r.error = "this field is required.";
	} else if (Array.isArray(value)) {
		if (rule?.multiple) {
			if (value.length > 0) {
				return value.map((v) => validateIntParameterSingle(v, rule));
			}
			r.error = "At least one value is required.";
		} else {
			r.error = "More than one value could not be selected.";
		}
	} else {
		return validateIntParameterSingle(value, rule);
	}
	return r;
};

export const validateFloatParameterSingle = (
	value: unknown,
	rule: IntParameter["rule"]
): ValidationResult => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};

	if (value === undefined || value === "") {
		if (rule?.sync) {
			return r;
		}
		r.error = "this field is required.";
	} else if (typeof value === "string") {
		if (/^[-+]?(\d+)(\.(\d+))?$/.test(value)) {
			return validateNumberParameter(Number.parseFloat(value), rule);
		}
	} else if (typeof value === "number") {
		return validateNumberParameter(value, rule);
	}
	return {
		value,
		valueLabel: value,
		error: "This field must be a number."
	};
};

export const validateFloatParameter = (
	value: unknown,
	rule: IntParameter["rule"],
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>
): ValidationResult | ValidationResult[] => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};

	if (value === undefined || value === "") {
		if (rule?.sync) {
			const sync = values[rule.sync];
			return {
				value: sync,
				valueLabel: sync
			};
		}
		r.error = "this field is required.";
	} else if (Array.isArray(value)) {
		if (rule?.multiple) {
			if (value.length > 0) {
				return value.map((v) => validateFloatParameterSingle(v, rule));
			}
			r.error = "At least one value is required.";
		} else {
			r.error = "More than one value could not be selected.";
		}
	} else {
		return validateFloatParameterSingle(value, rule);
	}

	return r;
};

export const validateInputParameterSingle = (
	value: unknown,
	rule: InputParameter["rule"]
): ValidationResult => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};
	if (value === undefined || value === "") {
		r.error = "this field is required.";
	} else if (typeof value !== "string") {
		r.error = `Invalid type of value. Expecting string: ${value}`;
	} else if (rule) {
		if (rule.minLength !== undefined && value.length < rule.minLength) {
			r.error = `This field must be at least ${rule.minLength} characters.`;
		} else if (
			rule.maxLength !== undefined &&
			rule.maxLength < value.length
		) {
			r.error = `This field must be ${rule.maxLength} characters or less.`;
		} else if (rule.pattern !== undefined) {
			if (new RegExp(rule.pattern).test(value)) {
				r.error = `This field must meet regular expression: ${rule.pattern}`;
			}
		}
	}
	return r;
};

export const validateInputParameter = (
	value: unknown,
	rule: InputParameter["rule"],
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>
): ValidationResult | ValidationResult[] => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};

	if (value === undefined) {
		r.error = "this field is required.";
	} else if (Array.isArray(value)) {
		if (value.length < 1) {
			r.error = "At lease one value is required.";
		} else {
			return value.map((v) => validateInputParameterSingle(v, rule));
		}
	} else {
		return validateInputParameterSingle(value, rule);
	}
	return r;
};

export const validateVariantParameter = (
	value: unknown,
	rule: VariantParameter["rule"],
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>
): ValidationResult => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};

	if (value === undefined) {
		r.error = "this field is required.";
	} else {
		const found = false;
		rule.values.forEach((e) => {
			if (found) {
				return;
			}
			if (e === value) {
				r.valueLabel = e;
			} else if (
				e !== null &&
				typeof e === "object" &&
				"value" in e &&
				e.value === value
			) {
				r.valueLabel = e.label;
			}
		});

		if (!found) {
			r.error = `${value} is not assignable`;
		}
	}

	return r;
};

export const validateSwitchParameter = (
	value: unknown,
	rule: SwitchParameter["rule"],
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>
): ValidationResult => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};

	if (value === undefined) {
		r.error = "this field is required.";
	} else if (typeof value !== "boolean") {
		r.error = `Invalid type of value. Expecting boolean: ${typeof value}`;
	} else if (rule.exclusive === undefined || !value) {
		return r;
	} else {
		const exValue = values[rule.exclusive];
		if (exValue !== null && exValue !== undefined) {
			r.error = `This field and ${rule.exclusive} could not be set simultaneously.`;
		}
	}

	return r;
};

export const validateOptionalParameterExclusive = (
	value: unknown,
	rule: OptionalParameter["rule"],
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>
): ValidationResult => {
	const r: ValidationResult = {
		value,
		valueLabel: value,
		error: undefined
	};

	if (rule.exclusive === undefined) {
		return r;
	}

	const exDef = defs[rule.exclusive];
	const exValue = values[rule.exclusive];
	if (
		exDef &&
		((exDef.type === "switch" && exValue === true) ||
			(exDef.type === "optional" &&
				(exValue !== undefined || exValue !== null)))
	) {
		r.error = `${value} and ${exValue} is not set simultaneously.`;
	}

	return r;
};

export const validateOptionalParameter = async (
	value: unknown,
	rule: OptionalParameter["rule"],
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>,
	validateDirectoryParameter: (
		v: unknown,
		r: DirectoryParameter["rule"],
		revision: unknown
	) => Promise<ValidationResult>
	// eslint-disable-next-line consistent-return
): Promise<ValidationResult | ValidationResult[]> => {
	switch (rule.type) {
		case "int":
			return validateIntParameter(value, rule.rule, defs, values);
		case "float":
			return validateFloatParameter(value, rule.rule, defs, values);
		case "input":
			return validateInputParameter(value, rule.rule, defs, values);
		case "variant":
			return validateVariantParameter(value, rule.rule, defs, values);
		case "directory":
			return validateDirectoryParameter(
				value,
				rule.rule,
				values[rule.rule.revision]
			);
	}
};

export const validateParameter = async (
	key: string,
	defs: Record<string, DetectionParameterDef>,
	values: Record<string, unknown>,
	validateDirectoryParameter: (
		v: unknown,
		rule: DirectoryParameter["rule"],
		revision: unknown
	) => Promise<ValidationResult>,
	validateRevisionParameter: (
		v: unknown,
		rule: RevisionParameter["rule"]
	) => Promise<ValidationResult>
	// eslint-disable-next-line consistent-return
): Promise<ValidationResult | ValidationResult[]> => {
	const def = defs[key];
	const value = values[key];
	switch (def.type) {
		case "int": {
			return validateIntParameter(value, def.rule, defs, values);
		}
		case "float": {
			return validateFloatParameter(value, def.rule, defs, values);
		}
		case "input": {
			return validateInputParameter(value, def.rule, defs, values);
		}
		case "variant": {
			return validateVariantParameter(value, def.rule, defs, values);
		}
		case "switch": {
			return validateSwitchParameter(value, def.rule, defs, values);
		}
		case "optional": {
			return validateOptionalParameter(
				value,
				def.rule,
				defs,
				values,
				validateDirectoryParameter
			);
		}

		case "directory": {
			return validateDirectoryParameter(
				value,
				def.rule,
				values[def.rule.revision]
			);
		}

		case "revision": {
			return validateRevisionParameter(value, def.rule);
		}
	}
};
