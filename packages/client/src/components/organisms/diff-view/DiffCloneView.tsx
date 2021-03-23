import React from "react";
import { EditorDidMount } from "react-monaco-editor";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { makeStyles } from "@material-ui/core";
import useSWR from "swr";

import ClonePair from "common/all/types/ClonePair";
import ClonePairId from "common/all/types/ClonePairId";
import Fragment from "common/all/types/Fragment";
import * as fetchCode from "common/auth-client/api/v1/projects/_projectName/_revision";

import { jsonFetcher } from "utils/fetcher";
import useMappingResult from "hooks/useMappingResult";

import CloneCodeView from "components/molecules/CloneCodeView";
import { MappingResult } from "common/all/types/EDetectionResult";

type DecorationIdMap = Record<string, string>;

type DecoratingFragments = Record<string, Fragment>;

type Instance = {
	editor: Monaco.editor.ICodeEditor;
	monaco: typeof Monaco;
};

const useStyles = makeStyles({
	root: {
		height: "100%"
	},
	clone: {
		width: "5px !important",
		marginLeft: "5px"
	},
	selected: {
		width: "7px !important",
		marginLeft: "4px",
		zIndex: 3
	},
	baseUnmapped: {
		backgroundColor: "#ffe6e6",
		zIndex: 1
	},
	baseUnmappedSelected: {
		backgroundColor: "#ff3d3d"
	},
	comparingUnmapped: {
		backgroundColor: "#e6e8ff"
	},
	comparingUnmappedSelected: {
		backgroundColor: "#3d5aff"
	},
	unified: {
		backgroundColor: "#f7e6ff",
		zIndex: 2
	},
	unifiedSelected: {
		backgroundColor: "#bb3dff"
	}
});

type State = {
	fileDependent: {
		orientation: "left" | "right";
		decoratingFragments: DecoratingFragments;
	};
	selectedDependent: {
		decorationIdMap: DecorationIdMap;
		previousSelected: string | null;
	};
};

type Action =
	| {
			type: "set-file";
			payload: {
				path: string;
				editor: Monaco.editor.ICodeEditor;
				text: string;
				orientation: "left" | "right";
				result: MappingResult;
				baseUnmapped: ClonePairId[];
				comparingUnmapped: ClonePairId[];
				unifiedClonePairs: {
					base: ClonePairId;
					comparing: ClonePairId[];
					p: ClonePair;
				}[];
				classes: Record<string, string>;
			};
	  }
	| {
			type: "set-selected";
			payload: {
				editor: Monaco.editor.ICodeEditor;
				selected: string | null;
				classes: Record<string, string>;
			};
	  };

const createDecoration = (
	fragment: Fragment,
	className: string
): Monaco.editor.IModelDeltaDecoration => ({
	range: new Monaco.Range(fragment.begin, 1, fragment.end - 1, 1),
	options: {
		isWholeLine: true,
		linesDecorationsClassName: className
	}
});

const setInitialDecorations = (
	classes: Record<string, string>,
	codeEditor: Monaco.editor.ICodeEditor,
	decoratingFragments: DecoratingFragments
): DecorationIdMap => {
	const decorations = Object.entries(decoratingFragments).map(([id, f]) => {
		if (id.startsWith("b")) {
			return createDecoration(
				f,
				`${classes.clone} ${classes.baseUnmapped}`
			);
		}
		if (id.startsWith("c")) {
			return createDecoration(
				f,
				`${classes.clone} ${classes.comparingUnmapped}`
			);
		}
		return createDecoration(f, `${classes.clone} ${classes.unified}`);
	});

	const decorationIds = codeEditor.deltaDecorations([], decorations);

	const idMap: DecorationIdMap = {};
	Object.keys(decoratingFragments).forEach((id, index) => {
		idMap[id] = decorationIds[index];
	});
	return idMap;
};

const updateDecoration = (
	editor: Monaco.editor.ICodeEditor,
	oldDecorationId: string,
	f: Fragment,
	className: string
): string =>
	editor.deltaDecorations(
		[oldDecorationId],
		[createDecoration(f, className)]
	)[0];

const selectedToClonePairId = (selected: string | null): string | null => {
	if (selected === null) {
		return null;
	}
	const index = selected.indexOf("-");
	if (index < 0) {
		return selected;
	}
	return selected.slice(index + 1);
};

const highlightSelected = (
	editor: Monaco.editor.ICodeEditor,
	selected: string | null,
	previousSelected: string | null,
	classes: Record<string, string>,
	decorationIdMap: DecorationIdMap,
	decoratingFragments: DecoratingFragments
): [DecorationIdMap, string | null] => {
	const next = { ...decorationIdMap };
	const normalized = selectedToClonePairId(selected);
	console.log(`${previousSelected} to ${normalized}`);

	if (
		normalized !== null &&
		normalized !== previousSelected &&
		normalized in next
	) {
		const f = decoratingFragments[normalized];
		next[normalized] = updateDecoration(
			editor,
			next[normalized],
			f,
			`${classes.selected} ${
				normalized.startsWith("b")
					? classes.baseUnmappedSelected
					: normalized.startsWith("c")
					? classes.comparingUnmappedSelected
					: classes.unifiedSelected
			}`
		);
		editor.revealLinesNearTop(
			f.begin,
			f.end,
			Monaco.editor.ScrollType.Smooth
		);
	}

	if (previousSelected !== null && previousSelected in next) {
		const f = decoratingFragments[previousSelected];
		next[previousSelected] = updateDecoration(
			editor,
			next[previousSelected],
			f,
			`${classes.clone} ${
				previousSelected.startsWith("b")
					? classes.baseUnmapped
					: previousSelected.startsWith("c")
					? classes.comparingUnmapped
					: classes.unified
			}`
		);
	}
	return [next, normalized];
};

const selectFragment = (
	orientation: "left" | "right"
): ((p: ClonePair) => Fragment) => ({ f1, f2 }: ClonePair) =>
	orientation === "left" ? f1 : f2;

const reducer: React.Reducer<State, Action> = (state, action): State => {
	switch (action.type) {
		case "set-file": {
			const {
				path,
				editor,
				text,
				orientation,
				result,
				baseUnmapped,
				comparingUnmapped,
				unifiedClonePairs,
				classes
			} = action.payload;

			const uri = Monaco.Uri.parse(`${path}?o=${orientation}`);
			if (editor.getModel()?.uri.toString() === uri.toString()) {
				return state;
			}

			const select = selectFragment(orientation);

			const decoratingFragments: DecoratingFragments = {};
			baseUnmapped.forEach((id) => {
				decoratingFragments[`b${id}`] = select(
					result.base.clonePairs[id]
				);
			});
			comparingUnmapped.forEach((id) => {
				decoratingFragments[`c${id}`] = select(
					result.comparing.clonePairs[id]
				);
			});
			unifiedClonePairs.forEach(({ base, comparing, p }) => {
				decoratingFragments[`u${p.id}`] = select(p);
				decoratingFragments[`b${base}`] = select(
					result.base.clonePairs[base]
				);
				comparing.forEach((id) => {
					decoratingFragments[`c${id}`] = select(
						result.comparing.clonePairs[id]
					);
				});
			});

			const model = Monaco.editor.getModel(uri);
			if (model) {
				editor.setModel(model);
			} else {
				editor.setModel(
					Monaco.editor.createModel(text, undefined, uri)
				);
			}
			const decorationIdMap = setInitialDecorations(
				classes,
				editor,
				decoratingFragments
			);

			return {
				fileDependent: {
					orientation,
					decoratingFragments
				},
				selectedDependent: {
					previousSelected: null,
					decorationIdMap
				}
			};
		}

		case "set-selected": {
			const { editor, selected, classes } = action.payload;

			const [decorationIdMap, previousSelected] = highlightSelected(
				editor,
				selected,
				state.selectedDependent.previousSelected,
				classes,
				state.selectedDependent.decorationIdMap,
				state.fileDependent.decoratingFragments
			);
			return {
				...state,
				selectedDependent: {
					previousSelected,
					decorationIdMap
				}
			};
		}
	}

	return state;
};

type Props = {
	selected: string | null;
	project: string;
	path: string;
	orientation: "left" | "right";
	baseUnmapped: ClonePairId[];
	comparingUnmapped: ClonePairId[];
	unifiedClonePairs: {
		base: ClonePairId;
		comparing: ClonePairId[];
		p: ClonePair;
	}[];
};

const DiffCloneView: React.FunctionComponent<Props> = ({
	selected,
	project,
	path,
	orientation,
	baseUnmapped,
	comparingUnmapped,
	unifiedClonePairs
}) => {
	const classes = useStyles();
	const { result, revision } = useMappingResult();
	const { data } = useSWR(
		fetchCode.route(project, revision, path),
		jsonFetcher<fetchCode.GetResponse>()
	);

	if (!data || data.error || "entries" in data) {
		throw new Error(`Failed to load file ${path}`);
	}

	const [instance, setInstance] = React.useState<Instance | null>(null);
	const [state, dispatch] = React.useReducer(reducer, {
		fileDependent: {
			orientation,
			decoratingFragments: {}
		},
		selectedDependent: {
			decorationIdMap: {},
			previousSelected: null
		}
	});

	const editorDidMount: EditorDidMount = React.useCallback(
		(editor, monaco) => {
			setInstance({
				editor,
				monaco
			});
		},
		[setInstance]
	);

	// on selected file changed
	React.useEffect(() => {
		if (instance) {
			dispatch({
				type: "set-file",
				payload: {
					path,
					editor: instance.editor,
					text: data.text,
					orientation,
					result,
					baseUnmapped,
					comparingUnmapped,
					unifiedClonePairs,
					classes
				}
			});
		}
	}, [instance, result]);

	// on selected clone changed
	React.useEffect(() => {
		if (instance) {
			dispatch({
				type: "set-selected",
				payload: {
					editor: instance.editor,
					selected,
					classes
				}
			});
		}
	}, [instance, selected]);

	return <CloneCodeView height="100%" editorDidMount={editorDidMount} />;
};

export default DiffCloneView;
