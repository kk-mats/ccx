/* eslint-disable react/destructuring-assignment */
import React from "react";
import { Redirect } from "react-router-dom";
import HTTPError from "ky";

type Props = {
	children: React.ReactNode;
};

type State =
	| {
			catch: true;
			error: Error;
			redirectTo?: undefined;
	  }
	| {
			catch: true;
			redirectTo: string;
	  }
	| {
			catch: false;
			error?: undefined;
	  };

export default class PrivateRoutesErrorBoundary extends React.Component<
	Props,
	State
> {
	constructor(props: Props) {
		super(props);
		this.state = {
			catch: false
		};
	}

	componentDidCatch(error: Error): void {
		if (error instanceof HTTPError) {
			this.setState({ catch: true, redirectTo: "/login" });
			return;
		}
		this.setState({ catch: true, error });
	}

	render(): React.ReactNode {
		if (this.state.catch) {
			if (this.state.redirectTo !== undefined) {
				return <Redirect to={this.state.redirectTo} />;
			}
			throw this.state.error;
		}
		return this.props.children;
	}
}
