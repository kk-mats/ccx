import React from "react";
import ImportForm from "components/organisms/ImportForm";
import FormOnlyTemplate from "components/templates/FormOnlyTemplate";
import AppBarTemplate from "components/templates/AppBarTemplate";

const New: React.FunctionComponent = () => {
	return (
		<AppBarTemplate>
			<FormOnlyTemplate pageTitle="" formTitle="Import Repository">
				<ImportForm />
			</FormOnlyTemplate>
		</AppBarTemplate>
	);
};

export default New;
