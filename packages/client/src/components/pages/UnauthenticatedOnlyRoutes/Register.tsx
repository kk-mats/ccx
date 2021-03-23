import React from "react";

import RegistrationForm from "components/organisms/RegistrationForm";
import FormOnlyTemplate from "components/templates/FormOnlyTemplate";

const Register: React.FunctionComponent = () => {
	console.log("register rendered");
	return (
		<FormOnlyTemplate pageTitle="" formTitle="Sign Up">
			<RegistrationForm />
		</FormOnlyTemplate>
	);
};

export default Register;
