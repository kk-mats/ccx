import React from "react";
import { Divider, makeStyles } from "@material-ui/core";

import { ValidateRepositoryPath } from "utils/validateRepositoryPath";

import { DetectorSection } from "components/organisms/detection-form/DetectorSection";
import ParametersSection from "components/organisms/detection-form/ParametersSection";
import ActionsSection from "components/organisms/detection-form/ActionsSection";
import { DetectionFormDispatchContext } from "contexts/DetectionFormDispatchContext";
import {
	DetectPluginContext,
	createInitialDetectPluginContext
} from "contexts/DetectPluginContext";
import {
	reducer,
	getInitialState,
	Config
} from "reducers/detectionFormReducer";

import { AvailableDetectPlugins } from "common/all/types/plugin";

const useStyles = makeStyles(() => ({
	root: {
		width: "100%"
	}
}));

type Props = {
	plugins: AvailableDetectPlugins;
	validateRepositoryPath: ValidateRepositoryPath;
	onRunButtonClicked: (
		config: Config,
		event: React.MouseEvent<HTMLButtonElement>
	) => Promise<void>;
};

export const DetectionConfigForm: React.FunctionComponent<Props> = ({
	plugins,
	validateRepositoryPath,
	onRunButtonClicked
}) => {
	const classes = useStyles();
	const detectorsInfo = React.useMemo(
		() => createInitialDetectPluginContext(plugins),
		[plugins]
	);

	const initializedReducer = React.useMemo(
		() => reducer(detectorsInfo, validateRepositoryPath),
		[detectorsInfo, validateRepositoryPath]
	);

	const [config, dispatch] = React.useReducer(
		initializedReducer,
		{ entity: detectorsInfo, validateRepositoryPath },
		getInitialState
	);

	return (
		<DetectPluginContext.Provider value={detectorsInfo}>
			<DetectionFormDispatchContext.Provider value={dispatch}>
				<form className={classes.root}>
					<DetectorSection
						id={config.formValues.pluginId}
						version={config.formValues.detectorVersion}
					/>
					<Divider />
					<ParametersSection config={config} />
					<Divider />
					<ActionsSection
						config={config}
						onRunButtonClicked={onRunButtonClicked}
					/>
				</form>
			</DetectionFormDispatchContext.Provider>
		</DetectPluginContext.Provider>
	);
};
