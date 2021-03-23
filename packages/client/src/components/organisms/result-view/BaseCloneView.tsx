import React from "react";
import { useParams } from "react-router-dom";
import { EditorDidMount } from "react-monaco-editor";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import useSWR from "swr";

import Fragment from "common/all/types/Fragment";
import ClonePairId from "common/all/types/ClonePairId";

import * as fetchCode from "common/auth-client/api/v1/projects/_projectName/_revision";

import { jsonFetcher } from "utils/fetcher";
import useSingleResult, {
	State as SingleResultState
} from "hooks/useSingleResult";
import BiasedClonePair from "types/BiasedClonePair";
import CloneCodeView from "components/molecules/CloneCodeView";

type DecorationIdMap = Record<number, string[]>;

type DecoratingFragments = Record<number, Fragment[]>;

type Instance = {
	editor: Monaco.editor.ICodeEditor;
	monaco: typeof Monaco;
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

const updateDecoration = (
	editor: Monaco.editor.ICodeEditor,
	id: ClonePairId,
	decorationIdMap: DecorationIdMap,
	decoratingFragments: DecoratingFragments,
	className: string
): string[] => {
	if (id in decorationIdMap) {
		return editor.deltaDecorations(
			decorationIdMap[id],
			decoratingFragments[id].map((f) => createDecoration(f, className))
		);
	}

	return [];
};

const setInitialDecorations = (
	cloneClass: string,
	codeEditor: Monaco.editor.ICodeEditor,
	decoratingFragments: DecoratingFragments
): DecorationIdMap => {
	const decorations = Object.entries(
		decoratingFragments
	).flatMap(([, fragments]) =>
		fragments.map((f) => createDecoration(f, cloneClass))
	);

	const decorationIds = codeEditor.deltaDecorations([], decorations);

	const idMap: DecorationIdMap = {};
	Object.keys(decoratingFragments).forEach((stringId, index) => {
		const id = Number(stringId);
		if (id in idMap) {
			idMap[id].push(decorationIds[index]);
		} else {
			idMap[id] = [decorationIds[index]];
		}
	});
	return idMap;
};

const highlightSelected = (
	editor: Monaco.editor.ICodeEditor,
	selected: ClonePairId | null,
	previousSelected: ClonePairId | null,
	classes: Record<"clone" | "selectedClone", string>,
	decorationIdMap: DecorationIdMap,
	decoratingFragments: DecoratingFragments,
	biased: Record<number, BiasedClonePair>
): DecorationIdMap => {
	const next = { ...decorationIdMap };
	console.log(`${previousSelected} to ${selected}`);

	if (selected !== null && selected in biased && selected in next) {
		const { f } = biased[selected];
		next[selected] = updateDecoration(
			editor,
			selected,
			next,
			decoratingFragments,
			classes.selectedClone
		);
		editor.revealLinesNearTop(
			f.begin,
			f.end,
			Monaco.editor.ScrollType.Smooth
		);
	}

	if (
		previousSelected !== null &&
		previousSelected in biased &&
		previousSelected in next
	) {
		next[previousSelected] = updateDecoration(
			editor,
			previousSelected,
			next,
			decoratingFragments,
			classes.clone
		);
	}
	return next;
};

type State = {
	fileDependent: {
		decoratingFragments: DecoratingFragments;
	};
	selectedDependent: {
		decorationIdMap: DecorationIdMap;
		previousSelected: ClonePairId | null;
	};
};

type Action =
	| {
			type: "set-file";
			payload: {
				editor: Monaco.editor.ICodeEditor;
				text: string;
				result: SingleResultState;
				classes: Record<"clone" | "selectedClone", string>;
			};
	  }
	| {
			type: "set-selected";
			payload: {
				editor: Monaco.editor.ICodeEditor;
				result: SingleResultState;
				selected: ClonePairId | null;
				classes: Record<"clone" | "selectedClone", string>;
			};
	  };

const reducer: React.Reducer<State, Action> = (state, action): State => {
	switch (action.type) {
		case "set-file": {
			const { editor, text, result, classes } = action.payload;
			const baseUri = Monaco.Uri.parse(result.base.path);
			if (editor.getModel()?.uri.toString() === baseUri.toString()) {
				return state;
			}

			const decoratingFragments: DecoratingFragments = [];
			Object.keys(result.biased)
				.map(Number)
				.forEach((id) => {
					const { f, paired: p } = result.biased[id];
					if (p.file === result.base.id) {
						decoratingFragments[id] = [f, p];
					} else {
						decoratingFragments[id] = [f];
					}
				});

			const model = Monaco.editor.getModel(baseUri);

			if (model) {
				editor.setModel(model);
			} else {
				editor.setModel(
					Monaco.editor.createModel(text, undefined, baseUri)
				);
			}
			const decorationIdMap = setInitialDecorations(
				classes.clone,
				editor,
				decoratingFragments
			);

			return {
				fileDependent: {
					decoratingFragments
				},
				selectedDependent: {
					previousSelected: null,
					decorationIdMap
				}
			};
		}

		case "set-selected": {
			const { editor, result, selected, classes } = action.payload;
			if (selected === state.selectedDependent.previousSelected) {
				return state;
			}

			const decorationIdMap = highlightSelected(
				editor,
				selected,
				state.selectedDependent.previousSelected,
				classes,
				state.selectedDependent.decorationIdMap,
				state.fileDependent.decoratingFragments,
				result.biased
			);
			return {
				...state,
				selectedDependent: {
					previousSelected: selected,
					decorationIdMap
				}
			};
		}
	}

	return state;
};

type Props = {
	revision: string;
	selected: ClonePairId | null;
	classes: Record<"clone" | "selectedClone", string>;
};

const BaseCloneView: React.FunctionComponent<Props> = ({
	revision,
	selected,
	classes
}) => {
	const { project } = useParams<{
		project: string;
	}>();

	const [result] = useSingleResult();

	const { data } = useSWR(
		fetchCode.route(project, revision, result.base.path),
		jsonFetcher<fetchCode.GetResponse>()
	);

	if (!data || data.error || "entries" in data) {
		throw data;
	}

	const [instance, setInstance] = React.useState<Instance | null>(null);
	const [state, dispatch] = React.useReducer(reducer, {
		fileDependent: {
			decoratingFragments: []
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
					editor: instance.editor,
					result,
					text: data.text,
					classes
				}
			});

			if (selected) {
				dispatch({
					type: "set-selected",
					payload: {
						editor: instance.editor,
						result,
						selected,
						classes
					}
				});
			}
		}
	}, [instance, result]);

	// on selected clone changed
	React.useEffect(() => {
		if (!instance) {
			return;
		}
		dispatch({
			type: "set-selected",
			payload: {
				editor: instance.editor,
				result,
				selected,
				classes
			}
		});
	}, [instance, selected]);

	return <CloneCodeView editorDidMount={editorDidMount} />;
};

export default BaseCloneView;
