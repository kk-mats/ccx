import React from "react";
import { Container } from "@material-ui/core";
import FormOnlyTemplate from "components/templates/FormOnlyTemplate";
import AppBarTemplate from "components/templates/AppBarTemplate";
import { UploadPluginForm } from "components/organisms/UploadPluginForm";

export const UploadPlugin: React.FunctionComponent = () => {
	return (
		<AppBarTemplate>
			<Container maxWidth="md">
				<UploadPluginForm />
			</Container>
		</AppBarTemplate>
	);
};
