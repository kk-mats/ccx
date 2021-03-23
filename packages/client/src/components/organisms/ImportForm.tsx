import React from "react";
import { TextField, Grid } from "@material-ui/core";
import { Redirect } from "react-router-dom";

import useForm from "hooks/useForm";
import useSnackbar from "hooks/useSnackbar";
import importProject from "apis/projects/importProject";
import ProgressButton from "components/atoms/ProgressButton";

import { supportedGitURLProtocols } from "common/all/constants/limitations/gitURL";
import {
	invalidGitURLErrorMessage,
	unsupportedGitProtocolErrorMessage
} from "common/all/errorMessages";

type State = {
	gitURL: string;
	name: string;
};

const extractProjectName = (url: string): string => {
	const match = url.match(/([\w-]+)\.git$/);
	if (match) {
		return match[1];
	}
	return "";
};

type FormValue = {
	gitURL: string;
	name: string;
};

type FormState = {
	gitURL: string;
	disabled: boolean;
};

const urlRegex = /^(\w+):\/\/(.+@)*([\w\d.]+)(:[\d]+){0,1}\/*(.*)\.git\/?$/;

const ImportProjectForm: React.FunctionComponent = () => {
	const [imported, setImported] = React.useState<boolean>(false);
	const { openSnackbar } = useSnackbar();
	const { formValue, formState, setFormValue, setFormState } = useForm<
		FormValue,
		FormState
	>(
		{
			gitURL: "",
			name: ""
		},
		{
			gitURL: "",
			disabled: true
		},
		(oldFormValue, newFormValue) => {
			const match = newFormValue.gitURL.match(urlRegex);
			let gitURL = "";
			if (!match) {
				gitURL = invalidGitURLErrorMessage;
			} else if (!supportedGitURLProtocols.includes(match[1])) {
				gitURL = unsupportedGitProtocolErrorMessage;
			}

			return {
				gitURL,
				disabled: Boolean(gitURL)
			};
		}
	);

	const onGitURLChange: React.ChangeEventHandler<HTMLInputElement> = (
		event
	) => {
		const gitURL = event.target.value;
		setFormValue({
			...formValue,
			gitURL,
			name: extractProjectName(gitURL)
		});
	};

	const onClick = async (
		event: React.MouseEvent<HTMLButtonElement>
	): Promise<void> => {
		event.preventDefault();
		const res = await importProject(formValue);
		if (res.error) {
			if (res.error.statusCode === 409) {
				setFormState({
					...formState,
					gitURL: "Project already exists."
				});
			} else {
				openSnackbar("error", res.error.message);
			}
		} else {
			setImported(true);
			openSnackbar(
				"success",
				"Your project has been imported successfully!"
			);
		}
	};

	return imported ? (
		<Redirect to={`/home/${formValue.name}`} />
	) : (
		<form>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<TextField
						required
						fullWidth
						type="url"
						variant="outlined"
						value={formValue.gitURL}
						error={Boolean(formState.gitURL)}
						helperText={formState.gitURL}
						label="Git Repository URL"
						placeholder="https://example.com/foo/bar.git"
						onChange={onGitURLChange}
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						disabled
						fullWidth
						variant="outlined"
						value={formValue.name}
						label="Project Name"
						helperText="Project name will be set automatically"
					/>
				</Grid>
				<Grid item xs={12}>
					<ProgressButton
						fullWidth
						type="submit"
						variant="contained"
						disabled={formState.disabled}
						onClick={onClick}
					>
						Import
					</ProgressButton>
				</Grid>
			</Grid>
		</form>
	);
};

export default ImportProjectForm;
