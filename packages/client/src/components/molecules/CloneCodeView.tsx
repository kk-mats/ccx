import React from "react";
import MonacoEditor, { MonacoEditorProps } from "react-monaco-editor";

type Props = MonacoEditorProps;

const defaultOptions: MonacoEditorProps["options"] = {
	readOnly: true,
	model: null,
	automaticLayout: true,
	smoothScrolling: true
};

// eslint-disable-next-line react/display-name
const CloneCodeView: React.FunctionComponent<Props> = React.memo(
	({ options, ...rest }) => {
		const op = React.useMemo(
			() => ({
				...defaultOptions,
				...options
			}),
			[options]
		);

		return <MonacoEditor options={op} {...rest} />;
	}
);

export default CloneCodeView;
