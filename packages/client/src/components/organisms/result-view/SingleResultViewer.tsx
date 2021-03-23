import React from "react";
import { CircularProgress, makeStyles } from "@material-ui/core";

import SingleResultProvider from "components/providers/SingleResultProvider";

import SplitPane from "components/atoms/SplitPane";
import Explorer from "components/organisms/result-view/Explorer";

const CloneView = React.lazy(
	() => import("components/organisms/result-view/CloneView")
);

type Props = {
	revision: string;
};

const useStyles = makeStyles({
	root: {
		"& > *": {
			height: "100%"
		}
	}
});

const SingleResultViewer: React.FunctionComponent<Props> = ({ revision }) => {
	const { root } = useStyles();

	return (
		<SingleResultProvider>
			<SplitPane
				className={root}
				allowResize
				split="vertical"
				minSize={150}
			>
				<Explorer />
				<React.Suspense fallback={<CircularProgress />}>
					<CloneView revision={revision} />
				</React.Suspense>
			</SplitPane>
		</SingleResultProvider>
	);
};

export default SingleResultViewer;
