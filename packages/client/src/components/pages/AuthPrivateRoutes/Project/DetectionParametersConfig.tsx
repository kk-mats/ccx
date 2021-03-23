import React from "react";
import { useHistory, useParams } from "react-router-dom";
import useSWR from "swr";
import runDetector from "apis/detection/dispatchDetection";

import { route, GetResponse } from "common/auth-client/api/v1/detectors";
import { jsonFetcher } from "utils/fetcher";
import disableRevalidate from "utils/disableRevalidate";
import { validateRepositoryPath } from "utils/validateRepositoryPath";
import { DetectionConfigForm } from "components/organisms/DetectionConfigForm";
import useSnackbar from "hooks/useSnackbar";
import { Config } from "reducers/detectionFormReducer";

export const DetectionParametersConfig: React.FunctionComponent = () => {
	const { project } = useParams<{ project: string }>();
	const history = useHistory();
	const { openSnackbar } = useSnackbar();

	const onRunButtonClicked = React.useCallback(
		async (
			config: Config,
			event: React.MouseEvent<HTMLButtonElement>
		): Promise<void> => {
			event.preventDefault();

			const [owner, id] = config.formValues.pluginId.split(":");
			const res = await runDetector(project, {
				plugin: {
					id,
					owner
				},
				args: {
					detectorVersion: config.formValues.detectorVersion,
					parameters: config.formValues.parameters
				}
			});

			if (res.error) {
				openSnackbar("error", res.error.message);
			} else {
				history.push(`/home/${project}/history/${res.historyId}`);
			}
		},
		[project]
	);

	const { data } = useSWR(
		route(),
		jsonFetcher<GetResponse>(),
		disableRevalidate
	);

	if (!data || data.error) {
		throw data;
	}

	return (
		<DetectionConfigForm
			plugins={data}
			validateRepositoryPath={validateRepositoryPath}
			onRunButtonClicked={onRunButtonClicked}
		/>
	);
};
