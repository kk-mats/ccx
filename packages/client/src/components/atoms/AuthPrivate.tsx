import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";

import AuthContext from "contexts/AuthContext";

type Props = Omit<RouteProps, "component" | "render" | "children"> & {
	children: React.ReactNode;
};

type ComponentProps = {
	children: React.ReactNode;
};

const Component: React.FunctionComponent<ComponentProps> = (
	props: ComponentProps
) => {
	const { children } = props;
	const [{ userId }] = React.useContext(AuthContext);

	if (!userId) {
		console.log("redirect login on ap");
		return <Redirect to="/login" />;
	}

	return <>{children}</>;
};

const AuthPrivate: React.FunctionComponent<Props> = (props: Props) => {
	const { children, ...rest } = props;

	return (
		// eslint-disable-next-line react/jsx-props-no-spreading
		<Route {...rest}>
			<Component>{children}</Component>
		</Route>
	);
};

export default AuthPrivate;
