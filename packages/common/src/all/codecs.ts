/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as t from "io-ts";
import * as tt from "io-ts-types/lib/date";
import { URL } from "url";

export const brand = <C extends t.Mixed, B extends string>(codec: C, b: B) =>
	t.intersection([
		codec,
		t.type({
			_brand: t.literal(b)
		})
	]);

const isValidURL = (input: unknown): input is URL => {
	return input instanceof URL;
};

export const url = new t.Type<URL, URL, unknown>(
	"URL",
	isValidURL,
	(input, context) =>
		isValidURL(input) ? t.success(input) : t.failure(input, context),
	t.identity
);

export const userId = brand(t.string, "UserId");

export const parameterKey = brand(t.string, "DetectorParameterKey");
export const parameterLabel = brand(t.string, "DetectorParameterLabel");
export const parameterDescription = brand(
	t.string,
	"DetectorParameterDescription"
);

export const projectRelativePath = brand(t.string, "ProjectRelativePath");
export const projectRevisionString = brand(t.string, "ProjectRevisionString");

export type ParameterDef<T extends string, R extends t.Mixed> = {
	type: t.LiteralC<T>;
	rule: R;
};

export type AbstractParameterRegistry<L extends t.Mixed, D extends t.Mixed> = {
	label: L;
	description: D;
};

const abstractParameter = <L extends t.Mixed, D extends t.Mixed>({
	label,
	description
}: AbstractParameterRegistry<L, D>) => ({
	label: t.union([label, t.undefined]),
	description: t.union([description, t.undefined])
});

type InjectRegistry<
	L extends t.Mixed,
	D extends t.Mixed,
	T extends string,
	R extends t.Mixed
> = AbstractParameterRegistry<L, D> & {
	def: ParameterDef<T, R>;
};

export const abstractInject = <
	L extends t.Mixed,
	D extends t.Mixed,
	T extends string,
	R extends t.Mixed
>({
	label,
	description,
	def
}: InjectRegistry<L, D, T, R>) =>
	t.type({
		...abstractParameter({
			label,
			description
		}),
		...def
	});

const inject = <T extends string, R extends t.Mixed>(def: ParameterDef<T, R>) =>
	abstractInject({
		label: parameterLabel,
		description: parameterDescription,
		def
	});

export const variantParameterValue = (valueType: t.StringC | t.NumberC) =>
	brand(valueType, "VariantParameterValue");

export const variantParameterValueElementLabel = brand(
	t.string,
	"VariantParameterValueElementLabel"
);

export type VariantParameterRegistry<L extends t.Mixed, V extends t.Mixed> = {
	label: L;
	value: (valueType: t.StringC | t.NumberC) => V;
};

export const variantParameterValueElement = <
	L extends t.Mixed,
	V extends t.Mixed
>(
	valueType: t.StringC | t.NumberC,
	registry: VariantParameterRegistry<L, V>
) =>
	t.union([
		registry.value(valueType),
		t.type({
			label: registry.label,
			value: registry.value(valueType)
		})
	]);

const variantParameterAbstractRule = <L extends t.Mixed, V extends t.Mixed>(
	valueType: t.StringC | t.NumberC,
	registry: VariantParameterRegistry<L, V>
) =>
	t.intersection([
		t.type({
			values: t.array(variantParameterValueElement(valueType, registry))
		}),
		t.partial({
			default: registry.value(valueType)
		})
	]);

export const numberParameterMin = brand(t.number, "NumberParameterMin");
export const numberParameterMinExclusive = brand(
	t.number,
	"NumberParameterMinExclusive"
);
export const numberParameterMax = brand(t.number, "NumberParameterMax");
export const numberParameterMaxExclusive = brand(
	t.number,
	"NumberParameterMaxExclusive"
);
export const numberParameterStep = brand(t.number, "NumberParameterStep");
const numberParameterDefault = brand(t.number, "NumberParameterDefault");

export type NumberParameterRegistry<
	D extends t.Mixed,
	MN extends t.Mixed,
	MNE extends t.Mixed,
	MX extends t.Mixed,
	MXE extends t.Mixed,
	S extends t.Mixed,
	SY extends t.Mixed
> = {
	default: D;
	min: MN;
	minExclusive: MNE;
	max: MX;
	maxExclusive: MXE;
	step: S;
	sync: SY;
	multiple: t.BooleanC;
};

const numberParameterAbstractDef = <
	T extends "int" | "float",
	D extends t.Mixed,
	MN extends t.Mixed,
	MNE extends t.Mixed,
	MX extends t.Mixed,
	MXE extends t.Mixed,
	S extends t.Mixed,
	SY extends t.Mixed
>(
	type: T,
	registry: NumberParameterRegistry<D, MN, MNE, MX, MXE, S, SY>
) => ({
	type: t.literal(type),
	rule: t.union([t.partial(registry), t.undefined])
});

export const inputParameterMinLength = brand(
	t.number,
	"InputParameterMinLength"
);

export const inputParameterMaxLength = brand(
	t.number,
	"InputParameterMaxLength"
);

export const inputParameterRegex = brand(t.string, "InputParameterRegex");

export const inputParameterDefault = brand(t.string, "InputParameterDefault");

export const switchParameterValue = brand(t.boolean, "SwitchParameterValue");

type SwitchParameterRegistry<V extends t.Mixed, E extends t.Mixed> = {
	valueType: V;
	exclusive: E;
};

const switchParameterAbstractRule = <V extends t.Mixed, E extends t.Mixed>({
	valueType,
	exclusive
}: SwitchParameterRegistry<V, E>) =>
	t.intersection([
		t.type({
			default: valueType
		}),
		t.partial({
			exclusive
		})
	]);

export type DirectoryParameterRegistry<R extends t.Mixed, D extends t.Mixed> = {
	revision: R;
	default: D;
};

export const abstractDirectoryParameterDef = <
	R extends t.Mixed,
	D extends t.Mixed
>(
	registry: DirectoryParameterRegistry<R, D>
) => ({
	type: t.literal("directory"),
	rule: t.intersection([
		t.type({
			revision: registry.revision
		}),
		t.partial({
			default: registry.default
		})
	])
});

export type RevisionParameterRegistry<D extends t.Mixed> = {
	default: D;
};

export const abstractRevisionParameterDef = <D extends t.Mixed>(
	registry: RevisionParameterRegistry<D>
) => ({
	type: t.literal("revision"),
	rule: t.union([
		t.partial({
			default: registry.default
		}),
		t.undefined
	])
});

export const abstractVariantParameterDef = <
	L extends t.Mixed,
	V extends t.Mixed
>(
	registry: VariantParameterRegistry<L, V>
) => ({
	type: t.literal("variant"),
	rule: t.union([
		variantParameterAbstractRule(t.string, registry),
		variantParameterAbstractRule(t.number, registry)
	])
});

export const abstractIntParameterDef = <
	D extends t.Mixed,
	MN extends t.Mixed,
	MNE extends t.Mixed,
	MX extends t.Mixed,
	MXE extends t.Mixed,
	S extends t.Mixed,
	SY extends t.Mixed
>(
	registry: NumberParameterRegistry<D, MN, MNE, MX, MXE, S, SY>
) => numberParameterAbstractDef("int", registry);

export const abstractFloatParameterDef = <
	D extends t.Mixed,
	MN extends t.Mixed,
	MNE extends t.Mixed,
	MX extends t.Mixed,
	MXE extends t.Mixed,
	S extends t.Mixed,
	SY extends t.Mixed
>(
	registry: NumberParameterRegistry<D, MN, MNE, MX, MXE, S, SY>
) => numberParameterAbstractDef("float", registry);

type InputParameterRegistry<
	D extends t.Mixed,
	P extends t.Mixed,
	MN extends t.Mixed,
	MX extends t.Mixed
> = {
	default: D;
	pattern: P;
	minLength: MN;
	maxLength: MX;
};

export const abstractInputParameterDef = <
	D extends t.Mixed,
	P extends t.Mixed,
	MN extends t.Mixed,
	MX extends t.Mixed
>(
	registry: InputParameterRegistry<D, P, MN, MX>
) => ({
	type: t.literal("input"),
	rule: t.union([
		t.partial({ ...registry, multiple: t.boolean }),
		t.undefined
	])
});

export const abstractSwitchParameterDef = <
	V extends t.Mixed,
	E extends t.Mixed
>(
	registry: SwitchParameterRegistry<V, E>
) => ({
	type: t.literal("switch"),
	rule: switchParameterAbstractRule(registry)
});

const directoryParameterDef = abstractDirectoryParameterDef({
	revision: parameterKey,
	default: projectRelativePath
});
export const directoryParameter = inject(directoryParameterDef);

const revisionParameterDef = abstractRevisionParameterDef({
	default: projectRevisionString
});
export const revisionParameter = inject(revisionParameterDef);

const variantParameterDef = abstractVariantParameterDef({
	label: variantParameterValueElementLabel,
	value: (valueType) => variantParameterValue(valueType)
});
export const variantParameter = inject(variantParameterDef);

const numberParameterRegistry = {
	default: numberParameterDefault,
	min: numberParameterMin,
	minExclusive: numberParameterMinExclusive,
	max: numberParameterMax,
	maxExclusive: numberParameterMaxExclusive,
	step: numberParameterStep,
	sync: parameterKey,
	multiple: t.boolean
};
const intParameterDef = abstractIntParameterDef(numberParameterRegistry);
export const intParameter = inject(intParameterDef);
const floatParameterDef = abstractFloatParameterDef(numberParameterRegistry);
export const floatParameter = inject(floatParameterDef);

const inputParameterDef = abstractInputParameterDef({
	default: inputParameterDefault,
	pattern: inputParameterRegex,
	minLength: inputParameterMinLength,
	maxLength: inputParameterMaxLength
});
export const inputParameter = inject(inputParameterDef);

const switchParameterDef = abstractSwitchParameterDef({
	valueType: switchParameterValue,
	exclusive: parameterKey
});
export const switchParameter = inject(switchParameterDef);

// non-optional parameter definitions
const pureParameterDefs = {
	variantParameterDef,
	intParameterDef,
	floatParameterDef,
	inputParameterDef,
	switchParameterDef,
	directoryParameterDef
};

const optionalParameterAbstractRule = <L extends string, R extends t.Mixed>(
	def: ParameterDef<L, R>
) =>
	t.intersection([
		t.type({
			type: def.type,
			rule: def.rule
		}),
		t.partial({
			exclusive: t.string
		})
	]);

type OptionalParameterRegistry<
	V extends t.Mixed,
	LV extends string,
	I extends t.Mixed,
	LI extends string,
	F extends t.Mixed,
	LF extends string,
	IN extends t.Mixed,
	LIN extends string,
	S extends t.Mixed,
	LS extends string,
	D extends t.Mixed,
	LD extends string
> = {
	variantParameterDef: ParameterDef<LV, V>;
	intParameterDef: ParameterDef<LI, I>;
	floatParameterDef: ParameterDef<LF, F>;
	inputParameterDef: ParameterDef<LIN, IN>;
	switchParameterDef: ParameterDef<LS, S>;
	directoryParameterDef: ParameterDef<LD, D>;
};

export const abstractOptionalParameterDef = <
	V extends t.Mixed,
	LV extends string,
	I extends t.Mixed,
	LI extends string,
	F extends t.Mixed,
	LF extends string,
	IN extends t.Mixed,
	LIN extends string,
	S extends t.Mixed,
	LS extends string,
	D extends t.Mixed,
	LD extends string
>(
	registry: OptionalParameterRegistry<
		V,
		LV,
		I,
		LI,
		F,
		LF,
		IN,
		LIN,
		S,
		LS,
		D,
		LD
	>
) => ({
	type: t.literal("optional"),
	default: t.unknown,
	rule: t.union([
		optionalParameterAbstractRule(registry.variantParameterDef),
		optionalParameterAbstractRule(registry.intParameterDef),
		optionalParameterAbstractRule(registry.floatParameterDef),
		optionalParameterAbstractRule(registry.inputParameterDef),
		optionalParameterAbstractRule(registry.directoryParameterDef)
	])
});

const optionalParameterDef = abstractOptionalParameterDef(pureParameterDefs);

export const optionalParameter = inject(optionalParameterDef);

type AbstractParameterDefRegistry<
	LA extends t.Mixed,
	DS extends t.Mixed,
	D extends t.Mixed,
	LD extends string,
	R extends t.Mixed,
	LR extends string,
	O extends t.Mixed,
	LO extends string,
	V extends t.Mixed,
	LV extends string,
	I extends t.Mixed,
	LI extends string,
	F extends t.Mixed,
	LF extends string,
	IN extends t.Mixed,
	LIN extends string,
	S extends t.Mixed,
	LS extends string,
	DI extends t.Mixed,
	LDI extends string
> = {
	directoryParameterDef: ParameterDef<LD, D>;
	revisionParameterDef: ParameterDef<LR, R>;
	optionalParameterDef: ParameterDef<LO, O>;
} & OptionalParameterRegistry<V, LV, I, LI, F, LF, IN, LIN, S, LS, DI, LDI> &
	AbstractParameterRegistry<LA, DS>;

export const abstractParameterDef = <
	LA extends t.Mixed,
	DS extends t.Mixed,
	D extends t.Mixed,
	LD extends string,
	R extends t.Mixed,
	LR extends string,
	O extends t.Mixed,
	LO extends string,
	V extends t.Mixed,
	LV extends string,
	I extends t.Mixed,
	LI extends string,
	F extends t.Mixed,
	LF extends string,
	IN extends t.Mixed,
	LIN extends string,
	S extends t.Mixed,
	LS extends string,
	DI extends t.Mixed,
	LDI extends string
>(
	registry: AbstractParameterDefRegistry<
		LA,
		DS,
		D,
		LD,
		R,
		LR,
		O,
		LO,
		V,
		LV,
		I,
		LI,
		F,
		LF,
		IN,
		LIN,
		S,
		LS,
		DI,
		LDI
	>
) =>
	t.intersection([
		t.type(
			abstractParameter({
				label: registry.label,
				description: registry.description
			})
		),
		t.union([
			t.type(registry.directoryParameterDef),
			t.type(registry.revisionParameterDef),
			t.type(registry.optionalParameterDef),
			t.type(registry.variantParameterDef),
			t.type(registry.intParameterDef),
			t.type(registry.floatParameterDef),
			t.type(registry.inputParameterDef),
			t.type(registry.switchParameterDef)
		])
	]);

export const parameterDef = abstractParameterDef({
	label: parameterLabel,
	description: parameterDescription,
	revisionParameterDef,
	optionalParameterDef,
	...pureParameterDefs
});

export const pluginId = brand(t.string, "PluginID");
export const pluginName = brand(t.string, "PluginName");
export const pluginOwner = brand(t.string, "PluginOwner");

export const plugin = t.type({
	id: pluginId,
	name: pluginName,
	owner: pluginOwner
});

export const detectorName = brand(t.string, "DetectorName");
export const detectorVersion = brand(t.string, "DetectorVersion");

type DetectorRegistry<N extends t.Mixed, V extends t.Mixed> = {
	name: N;
	version: V;
};

const abstractDetector = <N extends t.Mixed, V extends t.Mixed>(
	registry: DetectorRegistry<N, V>
) => t.type(registry);

export const detector = abstractDetector({
	name: detectorName,
	version: detectorVersion
});

export const gitBranchName = brand(t.string, "GitBranchName");
export const gitCommitSHA = brand(t.string, "GitCommitSHA");
export const gitURL = brand(url, "GitURL");
export const jobStarted = brand(tt.date, "JobStarted");
export const jobDispatched = brand(tt.date, "JobDispatched");
export const jobFinished = brand(tt.date, "JobFinished");
export const jobStatus = t.union([
	t.literal("Succeeded"),
	t.literal("Failed"),
	t.literal("Pending"),
	t.literal("Running")
]);

export const projectCreated = brand(tt.date, "ProjectCreated");
export const projectUpdated = brand(tt.date, "ProjectUpdated");
export const projectLastUpdated = brand(tt.date, "ProjectLastUpdated");
export const projectName = brand(t.string, "ProjectName");
export const gitProjectRevision = t.intersection([
	t.type({ commitSHA: gitCommitSHA }),
	t.partial({ branch: gitBranchName, updated: t.undefined })
]);
export const unversionedProjectRevision = t.intersection([
	t.type({
		updated: projectUpdated
	}),
	t.partial({
		commitSHA: t.undefined,
		branch: t.undefined
	})
]);
export const projectSource = t.partial({
	gitURL
});

export const projectRevision = gitCommitSHA;

export const detectionParameters = brand(
	t.UnknownRecord,
	"DetectionParameters"
);

type DetectionTargetRegistry<D extends t.Mixed, R extends t.Mixed> = {
	directory: D;
	revision: R;
};

const abstractDetectionTarget = <D extends t.Mixed, R extends t.Mixed>(
	registry: DetectionTargetRegistry<D, R>
) => t.type(registry);

export const detectionTarget = abstractDetectionTarget({
	directory: projectRelativePath,
	revision: projectRevision
});

type PluginRequestRegistry<
	PI extends t.Mixed,
	PO extends t.Mixed,
	A extends t.Mixed
> = {
	pluginId: PI;
	pluginOwner: PO;
	args: A;
};

const abstractPluginRequest = <
	PI extends t.Mixed,
	PO extends t.Mixed,
	A extends t.Mixed
>(
	registry: PluginRequestRegistry<PI, PO, A>
) =>
	t.type({
		plugin: t.type({
			id: registry.pluginId,
			owner: registry.pluginOwner
		}),
		args: registry.args
	});

type DetectRequestRegistry<
	PI extends t.Mixed,
	PO extends t.Mixed,
	V extends t.Mixed,
	P extends t.Mixed
> = Omit<PluginRequestRegistry<PI, PO, any>, "args"> & {
	detectorVersion: V;
	parameters: P;
};

export const abstractDetectRequest = <
	PI extends t.Mixed,
	PO extends t.Mixed,
	V extends t.Mixed,
	P extends t.Mixed
>(
	registry: DetectRequestRegistry<PI, PO, V, P>
) =>
	abstractPluginRequest({
		pluginId: registry.pluginId,
		pluginOwner: registry.pluginOwner,
		args: t.type({
			detectorVersion: registry.detectorVersion,
			parameters: registry.parameters
		})
	});

export const detectRequestParameter = t.type({
	label: t.string,
	value: t.unknown,
	valueLabel: t.unknown,
	description: t.union([parameterDescription, t.undefined])
});

export const detectRequest = t.type({
	plugin,
	targets: t.array(detectionTarget),
	args: t.type({
		detectorVersion,
		parameters: t.array(detectRequestParameter)
	})
});

export const historyId = brand(t.string, "HistoryId");

export const artifact = brand(t.string, "Artifact");

export const resultId = brand(t.number, "ResultId");

export const summary = t.type({
	id: resultId,
	numberOfClonePairs: t.number,
	parameters: detectionParameters
});

export const historyEntityProps = {
	essentials: {
		dispatched: jobDispatched,
		request: detectRequest,
		status: jobStatus,
		summaries: t.array(summary)
	},
	optionals: {
		started: jobStarted,
		finished: jobFinished
	}
};

export const historyEntity = t.intersection([
	t.type({
		historyId,
		artifacts: t.array(artifact)
	}),
	t.type(historyEntityProps.essentials),
	t.partial(historyEntityProps.optionals)
]);

export const historyEntityForClient = t.intersection([
	t.type({
		historyId,
		artifacts: t.array(artifact)
	}),
	t.type({
		...historyEntityProps.essentials,
		dispatched: t.string
	}),
	t.partial({
		...historyEntityProps.optionals,
		started: t.string,
		finished: t.string
	})
]);

export const projectEntityProps = {
	name: projectName,
	source: projectSource,
	created: projectCreated,
	lastUpdated: projectLastUpdated
};

export const projectEntity = t.type(projectEntityProps);

export type DetectPluginVariantRegistry<
	V extends t.Mixed,
	P extends t.Mixed
> = {
	version: V;
	parameter: P;
};

export const abstractDetectPluginVariant = <
	V extends t.Mixed,
	P extends t.Mixed
>(
	registry: DetectPluginVariantRegistry<V, P>
) =>
	t.type({
		versions: t.array(registry.version),
		parameters: t.record(t.string, registry.parameter)
	});

export const detectPluginVariant = abstractDetectPluginVariant({
	version: detectorVersion,
	parameter: parameterDef
});

export const detectPluginSchema = t.type({
	id: pluginId,
	name: pluginName,
	variants: t.array(detectPluginVariant)
});

export const availableDetectPlugins = t.type({
	global: t.array(detectPluginSchema),
	private: t.array(detectPluginSchema)
});

export const rawTarget = abstractDetectionTarget({
	directory: t.unknown,
	revision: t.unknown
});

const rawParameters = t.UnknownRecord;

export const rawDetectRequest = abstractDetectRequest({
	pluginId: t.string,
	pluginOwner: t.string,
	detectorVersion: t.string,
	parameters: rawParameters
});

export const position = brand(t.number, "Position");
export const clonePairId = brand(t.number, "ClonePairId");
export const fileId = brand(t.number, "FileId");
export const filePath = brand(t.string, "FilePath");
export const similarity = brand(t.number, "Similarity");

export const fragment = t.type({
	file: fileId,
	begin: position,
	end: position
});

export const clonePair = t.intersection([
	t.type({
		id: clonePairId,
		f1: fragment,
		f2: fragment
	}),
	t.partial({
		similarity
	})
]);

export const file = t.type({
	id: fileId,
	path: filePath
});

export const environment = t.type({
	detector: pluginName,
	version: detectorVersion,
	parameters: t.UnknownRecord
});

export const extensions = t.union([brand(t.object, "Extensions"), t.undefined]);

export const detectionResult = t.type({
	environment,
	extensions,
	files: t.array(file),
	clonePairs: t.array(clonePair)
});

export const normalizedDetectionResultHeader = t.type({
	environment,
	extensions
});

export const normalizedDetectionResultBody = t.type({
	files: t.record(t.number, file),
	clonePairs: t.record(t.number, clonePair)
});

export const directoryEntryName = brand(t.string, "DirectoryEntryName");

export const directoryEntry = t.type({
	type: t.union([t.literal("file"), t.literal("directory")]),
	name: directoryEntryName
});

const rawDirectoryParameterDef = abstractDirectoryParameterDef({
	revision: t.string,
	default: t.string
});

export const rawRevisionParameterDef = abstractRevisionParameterDef({
	default: t.string
});

export const rawVariantParameterDef = abstractVariantParameterDef({
	label: t.string,
	value: (valueType) => valueType
});

export const rawNumberParameterRegistry = {
	default: t.number,
	min: t.number,
	minExclusive: t.number,
	max: t.number,
	maxExclusive: t.number,
	step: t.number,
	sync: t.string,
	multiple: t.boolean
};
export const rawIntParameterDef = abstractIntParameterDef(
	rawNumberParameterRegistry
);
export const rawFloatParameterDef = abstractFloatParameterDef(
	rawNumberParameterRegistry
);

export const rawInputParameterDef = abstractInputParameterDef({
	default: t.string,
	pattern: t.string,
	minLength: t.number,
	maxLength: t.number
});

export const rawSwitchParameterDef = abstractSwitchParameterDef({
	valueType: t.boolean,
	exclusive: t.string
});

export const rawPureParameterDefs = {
	variantParameterDef: rawVariantParameterDef,
	intParameterDef: rawIntParameterDef,
	floatParameterDef: rawFloatParameterDef,
	inputParameterDef: rawInputParameterDef,
	switchParameterDef: rawSwitchParameterDef,
	directoryParameterDef: rawDirectoryParameterDef
};

export const rawOptionalParameterDef = abstractOptionalParameterDef(
	rawPureParameterDefs
);

export const rawParameterDef = abstractParameterDef({
	label: t.string,
	description: t.string,
	revisionParameterDef: rawRevisionParameterDef,
	optionalParameterDef: rawOptionalParameterDef,
	...rawPureParameterDefs
});

export type AbstractPluginEnvironmentRegistry<
	E extends t.Mixed,
	D extends t.Mixed,
	I extends t.Mixed
> = {
	command: E;
	dockerfile: D;
	image: I;
};

export const abstractPluginEnvironment = <
	E extends t.Mixed,
	D extends t.Mixed,
	I extends t.Mixed
>({
	command,
	dockerfile,
	image
}: AbstractPluginEnvironmentRegistry<E, D, I>) =>
	t.union([
		t.intersection([
			t.type({ command }),
			t.partial({ dockerfile: t.undefined, image: t.undefined })
		]),
		t.intersection([
			t.type({ dockerfile }),
			t.partial({ command: t.undefined, image: t.undefined })
		]),
		t.intersection([
			t.type({ image }),
			t.partial({ command: t.undefined, dockerfile: t.undefined })
		]),
		t.type({ command, dockerfile })
	]);

export const abstractMixedPluginEnvironment = <
	E extends t.Mixed,
	D extends t.Mixed,
	I extends t.Mixed
>(
	registry: AbstractPluginEnvironmentRegistry<E, D, I>
) => {
	const windows = abstractPluginEnvironment(registry);
	const linux = abstractPluginEnvironment(registry);

	return t.union([
		t.intersection([
			t.type({ windows }),
			t.partial({ linux: t.undefined })
		]),
		t.intersection([
			t.type({ linux }),
			t.partial({ windows: t.undefined })
		]),
		t.type({ windows, linux })
	]);
};

export const pluginEnvironmentDockerfile = brand(
	t.string,
	"PluginEnvironmentDockerfile"
);
export const pluginEnvironmentCommand = brand(
	t.string,
	"PluginEnvironmentCommand"
);
export const pluginEnvironmentImage = brand(t.string, "PluginEnvironmentImage");

export const pluginEnvironment = abstractPluginEnvironment({
	command: pluginEnvironmentCommand,
	dockerfile: pluginEnvironmentDockerfile,
	image: pluginEnvironmentImage
});

export const mixedPluginEnvironment = abstractMixedPluginEnvironment({
	command: pluginEnvironmentCommand,
	dockerfile: pluginEnvironmentDockerfile,
	image: pluginEnvironmentImage
});

export type PluginRegistry<
	N extends t.Mixed,
	E extends t.Mixed,
	D extends t.Mixed,
	I extends t.Mixed
> = {
	name: N;
} & AbstractPluginEnvironmentRegistry<E, D, I>;

export const abstractPluginConfig = <
	N extends t.Mixed,
	E extends t.Mixed,
	D extends t.Mixed,
	I extends t.Mixed
>({
	name,
	...rest
}: PluginRegistry<N, E, D, I>) =>
	t.type({
		name,
		environment: abstractMixedPluginEnvironment(rest)
	});

export type DetectPluginConfigRegistry<
	V extends t.Mixed,
	P extends t.Mixed,
	N extends t.Mixed,
	E extends t.Mixed,
	D extends t.Mixed,
	I extends t.Mixed
> = DetectPluginVariantRegistry<V, P> & PluginRegistry<N, E, D, I>;

export const abstractDetectPluginConfig = <
	V extends t.Mixed,
	P extends t.Mixed,
	N extends t.Mixed,
	E extends t.Mixed,
	D extends t.Mixed,
	I extends t.Mixed
>({
	version,
	parameter,
	...rest
}: DetectPluginConfigRegistry<V, P, N, E, D, I>) =>
	t.intersection([
		abstractPluginConfig(rest),
		t.type({
			variants: t.array(
				abstractDetectPluginVariant({
					version,
					parameter
				})
			)
		})
	]);

export const rawDetectPluginConfig = abstractDetectPluginConfig({
	name: t.string,
	version: t.string,
	parameter: rawParameterDef,
	command: t.string,
	dockerfile: t.string,
	image: t.string
});

export const detectPluginConfig = abstractDetectPluginConfig({
	name: pluginName,
	version: detectorVersion,
	parameter: parameterDef,
	command: pluginEnvironmentCommand,
	dockerfile: pluginEnvironmentDockerfile,
	image: pluginEnvironmentImage
});

export const analyzePluginConfig = abstractPluginConfig({
	name: pluginName,
	command: pluginEnvironmentCommand,
	dockerfile: pluginEnvironmentDockerfile,
	image: pluginEnvironmentImage
});
