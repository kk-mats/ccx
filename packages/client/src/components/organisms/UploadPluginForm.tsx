import React from "react";
import {
	Box,
	Typography,
	CircularProgress,
	colors,
	Paper,
	Button,
	TextField,
	Grid
} from "@material-ui/core";
import { useDropzone, DropzoneOptions, FileRejection } from "react-dropzone";
import yaml from "js-yaml";
import {
	checkUploadedPluginConfig,
	decodeRawDetectPluginConfig
} from "common/all/utils/decodeRawDetectPluginConfig";
import { DetectPluginConfig, PluginId } from "common/all/types/plugin";
import {
	route,
	PostRequest,
	PostResponse
} from "common/auth-client/api/v1/user/plugins";

import { DetectionConfigForm } from "components/organisms/DetectionConfigForm";
import api from "utils/api";
import { validateRepositoryPathMock } from "utils/validateRepositoryPath";
import { Config } from "reducers/detectionFormReducer";
import useSnackbar from "hooks/useSnackbar";
import { useHistory } from "react-router-dom";
import ProgressButton from "components/atoms/ProgressButton";

type ConfigFormPlaygroundProps = {
	config: DetectPluginConfig;
};

const onRunButtonClicked = async (
	config: Config,
	event: React.MouseEvent<HTMLButtonElement>
): Promise<void> => {
	return new Promise((resolve) => {
		resolve();
	});
};

const ConfigFormPreview: React.FunctionComponent<ConfigFormPlaygroundProps> = ({
	config
}) => {
	const [id, setId] = React.useState("plugin-id");

	const plugins = React.useMemo(() => {
		return {
			global: [],
			private: [
				{
					id: id as PluginId,
					name: config.name,
					variants: config.variants
				}
			]
		};
	}, [config, id]);

	return (
		<DetectionConfigForm
			plugins={plugins}
			validateRepositoryPath={validateRepositoryPathMock}
			onRunButtonClicked={onRunButtonClicked}
		/>
	);
};

type ErrorBoxProps = {
	errorSummary: string;
	errors: string[];
};

const ErrorBox: React.FunctionComponent<ErrorBoxProps> = ({
	errorSummary,
	errors
}) => {
	return (
		<>
			<Typography gutterBottom variant="h4">
				{errorSummary}
			</Typography>
			{errors.map((e, index) => (
				<Typography key={index} gutterBottom>
					{e}
				</Typography>
			))}
		</>
	);
};

type DropzoneProps = {
	filename: string | undefined;
	onAccepted: (file: File) => void;
	onRejected: (file: FileRejection) => void;
};

const Dropzone: React.FunctionComponent<DropzoneProps> = ({
	filename,
	onAccepted,
	onRejected
}) => {
	const [loading, setLoading] = React.useState(false);
	const onDrop = React.useCallback<NonNullable<DropzoneOptions["onDrop"]>>(
		(accepted, rejected): void => {
			setLoading(true);
			if (accepted.length > 0) {
				onAccepted(accepted[0]);
			} else {
				onRejected(rejected[0]);
			}
			setLoading(false);
		},
		[setLoading, onAccepted, onRejected]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		multiple: false,
		maxSize: 5 * 1000 * 1000, // 5 MB
		accept: ".yml, .yaml"
	});

	const message = React.useMemo(() => {
		if (isDragActive) {
			return (
				<Typography align="center" variant="h5">
					Drop the file here ...
				</Typography>
			);
		}

		if (filename) {
			return (
				<Typography align="center" variant="h5">
					Drag and drop a YAML file here, or click to select another
					one
				</Typography>
			);
		}

		return (
			<Typography align="center" variant="h5">
				Drag and drop a YAML file here, or click to select
			</Typography>
		);
	}, [filename, isDragActive]);

	return (
		<Box
			border={`2px dashed ${colors.blue.A200}`}
			borderRadius={4}
			bgcolor={colors.grey[200]}
			paddingY={4}
			{...getRootProps()}
		>
			{loading ? (
				<CircularProgress />
			) : (
				<>
					<input {...getInputProps()} />
					{message}
				</>
			)}
		</Box>
	);
};

type SelectedFile =
	| {
			name: string;
			config: DetectPluginConfig;
			errorSummary?: undefined;
			errors?: undefined;
	  }
	| {
			name: string;
			config?: undefined;
			errorSummary: string;
			errors: string[];
	  };

export const UploadPluginForm: React.FunctionComponent = () => {
	const history = useHistory();
	const { openSnackbar } = useSnackbar();
	const [selected, setSelected] = React.useState<SelectedFile>();

	const onAccepted = React.useCallback(
		(file: File) => {
			const reader = new FileReader();

			reader.onerror = (): void => {
				setSelected({
					name: file.name,
					errorSummary: "Failed to load contents",
					errors: []
				});
			};
			reader.onloadend = (): void => {
				const raw = yaml.load(reader.result as string);
				const result = decodeRawDetectPluginConfig(raw);
				if (result.value) {
					const config = (result.value as unknown) as DetectPluginConfig;
					const errors = checkUploadedPluginConfig(config);
					if (errors.length > 0) {
						setSelected({
							name: file.name,
							errorSummary: "Invalid config format",
							errors
						});
					} else {
						setSelected({
							name: file.name,
							config
						});
					}
				} else {
					console.log(result.report);
					setSelected({
						name: file.name,
						errorSummary: "Invalid config format",
						errors: result.report
					});
				}
			};

			reader.readAsText(file);
		},
		[setSelected]
	);

	const onRejected = React.useCallback(
		(file: FileRejection) => {
			setSelected({
				name: file.file.name,
				errorSummary: `${file.file.name} is not acceptable`,
				errors: file.errors.map((e) => e.message)
			});
		},
		[setSelected]
	);

	const onClick = React.useCallback(
		async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
			event.preventDefault();
			if (selected?.config) {
				const res = await api.post(route, {
					json: selected.config
				});
				if (res.ok) {
					openSnackbar(
						"success",
						`Your plugin ${selected.config.name} has been uploaded successfully!`
					);
					history.push("/");
				} else {
					openSnackbar(
						"error",
						`Failed to upload your plugin ${
							selected.config.name
						}: ${await res.json()}`
					);
				}
			}
		},
		[selected, history, openSnackbar]
	);

	const child: React.ReactNode = React.useMemo(() => {
		if (!selected) {
			return undefined;
		}

		let body: React.ReactNode;

		if (selected.config !== undefined) {
			return (
				<Box mt={2}>
					<Box display="flex" alignItems="center">
						<Box flexGrow={1}>
							<Typography variant="h6">
								{selected.name}
							</Typography>
						</Box>
						<ProgressButton
							fullWidth
							color="secondary"
							variant="contained"
							onClick={onClick}
						>
							Upload
						</ProgressButton>
					</Box>
					<Box mt={6}>
						<Typography gutterBottom variant="h4">
							Preview
						</Typography>
						<Paper>
							<Box paddingY={1} paddingX={2}>
								<ConfigFormPreview config={selected.config} />
							</Box>
						</Paper>
					</Box>
				</Box>
			);
		}

		return (
			<Box mt={2}>
				<Box display="flex" alignItems="center">
					<Box flexGrow={1}>
						<Typography variant="h6">{selected.name}</Typography>
					</Box>
					<Button disabled variant="contained" color="secondary">
						Upload
					</Button>
				</Box>
				<Box mt={6}>
					<ErrorBox
						errorSummary={selected.errorSummary}
						errors={selected.errors}
					/>
				</Box>
			</Box>
		);
	}, [selected]);

	return (
		<div>
			<Typography variant="h3" align="center">
				Upload Plugin
			</Typography>
			<Box marginY={2}>
				<Dropzone
					filename={selected?.name}
					onAccepted={onAccepted}
					onRejected={onRejected}
				/>
			</Box>
			{child}
		</div>
	);
};
