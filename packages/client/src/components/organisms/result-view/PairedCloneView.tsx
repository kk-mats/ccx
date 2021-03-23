import React from "react";
import { EditorDidMount } from "react-monaco-editor";
import useSWR from "swr";

import * as Monaco from "monaco-editor";

import * as fetchCode from "common/auth-client/api/v1/projects/_projectName/_revision";
import { jsonFetcher } from "utils/fetcher";

import CloneCodeView from "components/molecules/CloneCodeView";

type Instance = {
	editor: Monaco.editor.ICodeEditor;
	monaco: typeof Monaco;
};

type ComponentProps = {
	project: string;
	revision: string;
	paired: { path: string; begin: number; end: number };
};

const Component: React.FunctionComponent<ComponentProps> = ({
	project,
	revision,
	paired
}) => {
	const { data } = useSWR(
		fetchCode.route(
			project,
			revision,
			paired.path,
			paired.begin,
			paired.end
		),
		jsonFetcher<fetchCode.GetResponse>()
	);

	if (!data || data.error || "entries" in data) {
		throw data;
	}

	const [instance, setInstance] = React.useState<Instance | null>(null);

	const editorDidMount: EditorDidMount = React.useCallback(
		(editor, monaco) =>
			setInstance({
				editor,
				monaco
			}),
		[setInstance]
	);

	React.useEffect(() => {
		if (!instance) {
			return;
		}
		const baseUri = Monaco.Uri.parse(
			`${paired.path}?s=${paired.begin}&e=${paired.end}`
		);
		if (instance.editor.getModel()?.uri.toString() === baseUri.toString()) {
			return;
		}

		const model = Monaco.editor.getModel(baseUri);
		if (model) {
			instance.editor.setModel(model);
		} else {
			instance.editor.setModel(
				Monaco.editor.createModel(data.text, undefined, baseUri)
			);
		}
	}, [instance, paired]);

	const options: Monaco.editor.IStandaloneEditorConstructionOptions = React.useMemo(
		() => ({
			lineNumbers: (ln) => (ln + paired.begin - 1).toFixed()
		}),
		[paired.begin]
	);

	return <CloneCodeView editorDidMount={editorDidMount} options={options} />;
};

type Props = {
	project: string;
	revision: string;
	paired: { path: string; begin: number; end: number } | null;
};

const PairedCloneView: React.FunctionComponent<Props> = ({
	paired,
	...rest
}) => {
	if (paired === null) {
		return <></>;
	}
	return <Component paired={paired} {...rest} />;
};

export default PairedCloneView;
