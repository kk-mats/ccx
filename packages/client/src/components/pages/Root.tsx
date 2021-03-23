import React from "react";
import { Switch, Link, Route, Redirect } from "react-router-dom";

import UnauthenticatedOnly from "components/atoms/UnauthenticatedOnly";
import AuthPrivate from "components/atoms/AuthPrivate";
import Login from "components/pages/UnauthenticatedOnlyRoutes/Login";
import Register from "components/pages//UnauthenticatedOnlyRoutes/Register";
import New from "components/pages/AuthPrivateRoutes/New";
import Home from "components/pages/AuthPrivateRoutes/Home";
import { UploadPlugin } from "components/pages/AuthPrivateRoutes/UploadPlugin";
import PrivateRoutesErrorBoundary from "components/providers/PrivateRoutesErrorBoundary";

const Root: React.FunctionComponent = () => {
	return (
		<Switch>
			<Route exact path="/">
				<Redirect to="/login" />
				<Link to="/login">login</Link>
			</Route>
			<Route path="*">
				<PrivateRoutesErrorBoundary>
					<AuthPrivate exact path="/new">
						<New />
					</AuthPrivate>
					<AuthPrivate path="/upload">
						<UploadPlugin />
					</AuthPrivate>
					<AuthPrivate path="/home">
						<Home />
					</AuthPrivate>
					<UnauthenticatedOnly exact path="/login">
						<Login />
					</UnauthenticatedOnly>
					<UnauthenticatedOnly exact path="/register">
						<Register />
					</UnauthenticatedOnly>
				</PrivateRoutesErrorBoundary>
			</Route>
		</Switch>
	);
};

export default Root;
