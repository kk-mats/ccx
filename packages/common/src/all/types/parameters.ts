import * as t from "io-ts";

import {
	detectionParameters,
	directoryParameter,
	floatParameter,
	inputParameter,
	intParameter,
	optionalParameter,
	revisionParameter,
	switchParameter,
	variantParameter
} from "../codecs";

export type DirectoryParameter = t.TypeOf<typeof directoryParameter>;
export type RevisionParameter = t.TypeOf<typeof revisionParameter>;
export type VariantParameter = t.TypeOf<typeof variantParameter>;
export type IntParameter = t.TypeOf<typeof intParameter>;
export type FloatParameter = t.TypeOf<typeof floatParameter>;
export type InputParameter = t.TypeOf<typeof inputParameter>;
export type SwitchParameter = t.TypeOf<typeof switchParameter>;
export type OptionalParameter = t.TypeOf<typeof optionalParameter>;

export type DetectionParameterDef =
	| DirectoryParameter
	| RevisionParameter
	| VariantParameter
	| IntParameter
	| FloatParameter
	| InputParameter
	| SwitchParameter
	| OptionalParameter;

export type DetectionParameters = t.TypeOf<typeof detectionParameters>;
