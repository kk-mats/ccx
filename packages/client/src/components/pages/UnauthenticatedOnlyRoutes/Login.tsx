import React from "react";

import LoginForm from "components/organisms/LoginForm";
import FormOnlyTemplate from "components/templates/FormOnlyTemplate";

const Login: React.FunctionComponent = () => {
	console.log("login rendered");
	return (
		<FormOnlyTemplate pageTitle="" formTitle="Sign In">
			<LoginForm />
		</FormOnlyTemplate>
	);
};

export default Login;
