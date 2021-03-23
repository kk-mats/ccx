import React from "react";
import {
	Grid,
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	ListSubheader
} from "@material-ui/core";
import DetectionFormSection from "components/molecules/detection-form/DetectionFormSection";
import {
	DetectPluginContext,
	DetectPluginsEntity,
	PrefixedPluginId
} from "contexts/DetectPluginContext";
import {
	DetectionFormDispatchContext,
	DetectionFormDispatchAction
} from "contexts/DetectionFormDispatchContext";
import DetectorVersion from "common/all/types/DetectorVersion";

const sx = { m: 1 };

type Props = {
	id: PrefixedPluginId;
	version: DetectorVersion;
};

type ComponentProps = Props &
	DetectPluginsEntity & {
		dispatch: React.Dispatch<DetectionFormDispatchAction>;
	};

// eslint-disable-next-line react/display-name
const Component: React.FunctionComponent<ComponentProps> = React.memo(
	({ id, version, dispatch, ids, plugins }) => {
		const onDetectorChange: React.ChangeEventHandler<{
			name?: string | undefined;
			value: unknown;
		}> = React.useCallback(
			(event) =>
				dispatch({
					type: "change-detector",
					payload: {
						id: event.target.value as PrefixedPluginId
					}
				}),
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[dispatch]
		);

		const onVersionChange: React.ChangeEventHandler<{
			name?: string | undefined;
			value: unknown;
		}> = React.useCallback(
			(event) =>
				dispatch({
					type: "change-version",
					payload: {
						version: event.target.value as DetectorVersion
					}
				}),
			[dispatch]
		);

		return (
			<DetectionFormSection title="Detector">
				<Box m={1}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel>Name</InputLabel>
								<Select value={id} onChange={onDetectorChange}>
									{ids.map((pid) => (
										<MenuItem key={pid} value={pid}>
											{pid.startsWith("private:")
												? `${plugins[pid].name} [Uploaded]`
												: plugins[pid].name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel>Version</InputLabel>
								<Select
									value={version}
									onChange={onVersionChange}
								>
									{plugins[id].versions.map((v) => (
										<MenuItem key={v} value={v}>
											{v}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>
				</Box>
			</DetectionFormSection>
		);
	}
);

export const DetectorSection: React.FunctionComponent<Props> = (props) => {
	const dispatch = React.useContext(DetectionFormDispatchContext);
	const { ids, plugins } = React.useContext(DetectPluginContext);

	return (
		<Component dispatch={dispatch} ids={ids} plugins={plugins} {...props} />
	);
};
