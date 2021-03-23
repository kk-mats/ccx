import React from "react";

import UnauthenticatedOnly from "components/atoms/UnauthenticatedOnly";

import Login from "components/pages/UnauthenticatedOnlyRoutes/Login";
import Register from "components/pages/UnauthenticatedOnlyRoutes/Register";

const UnauthenticatedOnlyRoutes: React.FunctionComponent = () => (
	<>
		<UnauthenticatedOnly exact path="/login">
			<Login />
		</UnauthenticatedOnly>
		<UnauthenticatedOnly exact path="/register">
			<Register />
		</UnauthenticatedOnly>
	</>
);

export default UnauthenticatedOnlyRoutes;
