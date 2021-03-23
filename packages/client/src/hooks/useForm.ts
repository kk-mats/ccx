import React from "react";

type Return<FormValue, FormState> = {
	formValue: FormValue;
	formState: FormState;
	setFormValue: (newFormValue: FormValue) => void;
	setFormState: React.Dispatch<React.SetStateAction<FormState>>;
};

type InitialState<S> = S | (() => S);

const useForm = <FormValue, FormState>(
	initialFormValue: InitialState<FormValue>,
	initialFormState: InitialState<FormState>,
	formStateReducer: (
		oldFormValue: FormValue,
		newFormValue: FormValue,
		oldFormState: FormState
	) => FormState
): Return<FormValue, FormState> => {
	const [formValue, setFormValue] = React.useState(initialFormValue);
	const [formState, setFormState] = React.useState(initialFormState);

	const updateFormValue = (newFormValue: FormValue): void => {
		setFormState(formStateReducer(formValue, newFormValue, formState));
		setFormValue(newFormValue);
	};

	return {
		formValue,
		formState,
		setFormValue: updateFormValue,
		setFormState
	};
};

export default useForm;
