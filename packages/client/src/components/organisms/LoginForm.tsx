import React from "react";
import { Link, useHistory } from "react-router-dom";
import {
	TextField,
	Theme,
	useTheme,
	makeStyles,
	createStyles,
	Button
} from "@material-ui/core";

import { promise } from "apis/session/signIn";
import useForm from "hooks/useForm";
import ProgressButton from "components/atoms/ProgressButton";
import AuthContext from "contexts/AuthContext";
import SnackbarContext from "contexts/SnackbarContext";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		field: {
			marginBottom: theme.spacing(2)
		},
		actions: {
			marginTop: theme.spacing(4),
			textAlign: "center",
			"& > *:last-child": {
				marginTop: theme.spacing(4)
			}
		}
	})
);

type FormValue = {
	userId: string;
	password: string;
};

type FormState = {
	submitDisabled: boolean;
};

type ComponentProps = {
	formValue: FormValue;
	formState: FormState;
	setUserId: React.ChangeEventHandler<HTMLInputElement>;
	setPassword: React.ChangeEventHandler<HTMLInputElement>;
	onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
};

const Component: React.FunctionComponent<ComponentProps> = (
	props: ComponentProps
) => {
	const { formValue, formState, setUserId, setPassword, onSubmit } = props;
	const classes = useStyles(useTheme());

	return (
		<form>
			<TextField
				required
				fullWidth
				className={classes.field}
				label="User ID"
				variant="outlined"
				value={formValue.userId}
				onChange={setUserId}
			/>
			<TextField
				required
				fullWidth
				className={classes.field}
				label="Password"
				variant="outlined"
				type="password"
				value={formValue.password}
				onChange={setPassword}
			/>
			<div className={classes.actions}>
				<ProgressButton
					fullWidth
					type="submit"
					variant="contained"
					disabled={formState.submitDisabled}
					onClick={onSubmit}
				>
					Login
				</ProgressButton>
				<Button
					fullWidth
					component={Link}
					color="secondary"
					to="/register"
				>
					Sign Up
				</Button>
			</div>
		</form>
	);
};

const LoginForm: React.FunctionComponent = () => {
	const [, authDispatch] = React.useContext(AuthContext);
	const { openSnackbar } = React.useContext(SnackbarContext);
	const history = useHistory();

	const { formValue, formState, setFormValue } = useForm<
		FormValue,
		FormState
	>(
		{ userId: "", password: "" },
		{ submitDisabled: true },
		(oldFormValue, newFormValue) => ({
			submitDisabled:
				newFormValue.userId === "" || newFormValue.password === ""
		})
	);

	const setUserId: React.ChangeEventHandler<HTMLInputElement> = (
		event
	): void => {
		setFormValue({
			...formValue,
			userId: event.target.value
		});
	};

	const setPassword: React.ChangeEventHandler<HTMLInputElement> = (
		event
	): void => {
		setFormValue({
			...formValue,
			password: event.target.value
		});
	};

	const onSubmit = async (
		event: React.MouseEvent<HTMLButtonElement>
	): Promise<void> => {
		event.preventDefault();
		const result = await promise(
			{
				userId: formValue.userId,
				password: formValue.password
			},
			{
				throwHttpErrors: false
			}
		);

		if (result.error) {
			openSnackbar("error", result.error.message);
			return;
		}

		if (!result.error) {
			history.push("/home");
			authDispatch({
				type: "sign-in",
				payload: {
					userId: result.userId
				}
			});
		}
	};

	return (
		<Component
			formValue={formValue}
			formState={formState}
			setUserId={setUserId}
			setPassword={setPassword}
			onSubmit={onSubmit}
		/>
	);
};

export default LoginForm;
