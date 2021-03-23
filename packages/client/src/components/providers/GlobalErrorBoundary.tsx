import React from "react";
import ky from "ky";
import { Container, Box, Typography } from "@material-ui/core";

type Props = {
	children: React.ReactNode;
};

type State =
	| {
			catch: true;
			error: Error;
			errorInfo: React.ErrorInfo;
	  }
	| {
			catch: false;
			error?: undefined;
			errorInfo?: undefined;
	  };

export default class GlobalErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			catch: false
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		this.setState({ catch: true, error, errorInfo });
	}

	render(): React.ReactNode {
		// eslint-disable-next-line react/destructuring-assignment
		if (this.state.catch) {
			const { error, errorInfo } = this.state;
			if (error instanceof ky.HTTPError) {
				return (
					<Container>
						<Box>
							<Typography component="h1" variant="h3">
								{error.response.status}
							</Typography>
							<Typography component="h2" variant="h1">
								{error.response.statusText}
							</Typography>
						</Box>
					</Container>
				);
			}
			return (
				<div>
					<p> Error </p>
					<p>{JSON.stringify(error)}</p>
					<p>{errorInfo.componentStack}</p>
				</div>
			);
		}
		const { children } = this.props;

		return children;
	}
}
