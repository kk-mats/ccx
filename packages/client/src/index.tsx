import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { SWRConfig } from "swr";
import {
	CssBaseline,
	ThemeProvider,
	CircularProgress
} from "@material-ui/core";

import theme from "theme";
import Root from "components/pages/Root";

import AuthProvider from "components/providers/AuthProvider";
import SnackbarProvider from "components/providers/SnackbarProvider";
import GlobalErrorBoundary from "components/providers/GlobalErrorBoundary";
import { StylesProvider } from "@material-ui/core/styles";

const Index: React.FunctionComponent = () => (
	<StylesProvider injectFirst>
		<ThemeProvider theme={theme}>
			<BrowserRouter basename={process.env.URL_BASE}>
				<GlobalErrorBoundary>
					<React.Suspense
						fallback={<CircularProgress color="secondary" />}
					>
						<SnackbarProvider>
							<SWRConfig
								value={{
									suspense: true,
									shouldRetryOnError: false
								}}
							>
								<AuthProvider>
									<CssBaseline />
									<Root />
								</AuthProvider>
							</SWRConfig>
						</SnackbarProvider>
					</React.Suspense>
				</GlobalErrorBoundary>
			</BrowserRouter>
		</ThemeProvider>
	</StylesProvider>
);

ReactDOM.render(<Index />, document.getElementById("root"));
