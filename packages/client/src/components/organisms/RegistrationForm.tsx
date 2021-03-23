import React from "react";
import { Redirect } from "react-router-dom";
import {
	TextField,
	Theme,
	useTheme,
	makeStyles,
	createStyles
} from "@material-ui/core";

import {
	userIdLimitation,
	passwordLimitation
} from "common/all/constants/limitations/user";
import {
	tooShortUserIdErrorMessage,
	tooLongUserIdErrorMessage,
	invalidUserIdErrorMessage,
	unavailableUserIdErrorMessage,
	tooShortPasswordErrorMessage,
	tooLongPasswordErrorMessage,
	invalidPasswordErrorMessage
} from "common/all/errorMessages";

import { promise } from "apis/user/signUp";
import checkUserId from "apis/user/checkUserId";
import useForm from "hooks/useForm";
import AuthContext from "contexts/AuthContext";
import ProgressButton from "components/atoms/ProgressButton";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		field: {
			marginBottom: theme.spacing(2)
		},
		actions: {
			marginTop: theme.spacing(4),
			textAlign: "center"
		}
	})
);

type FormValue = {
	userId: string;
	password1: string;
	password2: string;
};

type FormState = {
	submitDisabled: boolean;
	userIdError: string;
	password1Error: string;
	password2Error: string;
};

type ComponentProps = {
	formValue: FormValue;
	formState: FormState;
	setUserId: React.ChangeEventHandler<HTMLInputElement>;
	setPassword1: React.ChangeEventHandler<HTMLInputElement>;
	setPassword2: React.ChangeEventHandler<HTMLInputElement>;
	onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
};

const Component: React.FunctionComponent<ComponentProps> = (
	props: ComponentProps
) => {
	const {
		formValue,
		formState,
		setUserId,
		setPassword1,
		setPassword2,
		onSubmit
	} = props;
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
				error={Boolean(formState.userIdError)}
				helperText={formState.userIdError}
				onChange={setUserId}
			/>
			<TextField
				required
				fullWidth
				className={classes.field}
				label="Password"
				variant="outlined"
				type="password"
				value={formValue.password1}
				error={Boolean(formState.password1Error)}
				helperText={formState.password1Error}
				onChange={setPassword1}
			/>
			<TextField
				required
				fullWidth
				className={classes.field}
				label="Confirm Password"
				variant="outlined"
				type="password"
				value={formValue.password2}
				error={Boolean(formState.password2Error)}
				helperText={formState.password2Error}
				onChange={setPassword2}
			/>
			<div className={classes.actions}>
				<ProgressButton
					fullWidth
					type="submit"
					variant="contained"
					disabled={formState.submitDisabled}
					onClick={onSubmit}
				>
					Register
				</ProgressButton>
			</div>
		</form>
	);
};

const RegistrationForm: React.FunctionComponent = () => {
	const [, dispatch] = React.useContext(AuthContext);
	const [userIdCheckTimer, setUserIdCheckTimer] = React.useState<number>();
	const [receivedUserId, setReceivedUserId] = React.useState<string>();

	const { formValue, formState, setFormValue, setFormState } = useForm<
		FormValue,
		FormState
	>(
		{ userId: "", password1: "", password2: "" },
		{
			submitDisabled: true,
			userIdError: "",
			password1Error: "",
			password2Error: ""
		},
		(oldFormValue, newFormValue, oldFormState) => {
			let userIdError = "";
			if (newFormValue.userId.length < userIdLimitation.minlength) {
				userIdError = tooShortUserIdErrorMessage;
			} else if (
				userIdLimitation.maxlength < newFormValue.userId.length
			) {
				userIdError = tooLongUserIdErrorMessage;
			} else if (!userIdLimitation.validator.test(newFormValue.userId)) {
				userIdError = invalidUserIdErrorMessage;
			}

			let password1Error = "";
			if (newFormValue.password1.length < passwordLimitation.minlength) {
				password1Error = tooShortPasswordErrorMessage;
			} else if (
				passwordLimitation.maxlength < newFormValue.password1.length
			) {
				password1Error = tooLongPasswordErrorMessage;
			} else if (
				!passwordLimitation.validator.test(newFormValue.password1)
			) {
				password1Error = invalidPasswordErrorMessage;
			}

			const password2Error =
				newFormValue.password1 === newFormValue.password2
					? ""
					: "Not the same password at the first one.";
			const submitDisabled = Boolean(
				userIdError || password1Error || password2Error
			);

			return {
				userIdError,
				password1Error,
				password2Error,
				submitDisabled
			};
		}
	);

	const setUserId: React.ChangeEventHandler<HTMLInputElement> = (
		event
	): void => {
		const userId = event.target.value;
		setFormState({
			...formState,
			userIdError: ""
		});
		setFormValue({
			...formValue,
			userId
		});

		if (userIdCheckTimer) {
			clearTimeout(userIdCheckTimer);
		}
		if (!formState.userIdError) {
			setUserIdCheckTimer(
				window.setTimeout(() => {
					checkUserId({ userId }, { throwHttpErrors: false }).then(
						(value) => {
							if (value.error) {
								setFormState({
									...formState,
									userIdError: `User ID ${userId} is not available.`
								});
							}
						}
					);
				}, 500)
			);
		}
	};

	const setPassword1: React.ChangeEventHandler<HTMLInputElement> = (
		event
	): void => {
		setFormValue({
			...formValue,
			password1: event.target.value
		});
	};

	const setPassword2: React.ChangeEventHandler<HTMLInputElement> = (
		event
	): void => {
		setFormValue({
			...formValue,
			password2: event.target.value
		});
	};

	const onSubmit = async (
		event: React.MouseEvent<HTMLButtonElement>
	): Promise<void> => {
		event.preventDefault();
		const result = await promise({
			userId: formValue.userId,
			password: formValue.password1
		});

		if (!result.error) {
			setReceivedUserId(result.userId);
		}
	};

	React.useEffect(() => {
		if (receivedUserId) {
			dispatch({
				type: "sign-in",
				payload: {
					userId: receivedUserId
				}
			});
		}
	}, [receivedUserId, dispatch]);

	return (
		<>
			{receivedUserId && <Redirect to="/home" />}
			<Component
				formValue={formValue}
				formState={formState}
				setUserId={setUserId}
				setPassword1={setPassword1}
				setPassword2={setPassword2}
				onSubmit={onSubmit}
			/>
		</>
	);
};

export default RegistrationForm;
