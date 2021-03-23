import React from "react";
import { useHistory } from "react-router-dom";
import { PlusCircle } from "mdi-material-ui";

import AppBarMenu from "components/atoms/AppBarMenu";

const AddMenu: React.FunctionComponent = () => {
	const history = useHistory();

	const onImportClick = React.useCallback((): void => {
		history.push("/new");
	}, [history.push]);

	const onUploadPluginClick = React.useCallback((): void => {
		history.push("/upload/plugin");
	}, [history.push]);

	const items = React.useMemo(
		() => [
			{
				label: "Import Git Repository",
				onClick: onImportClick
			},
			{
				label: "Upload Plugin",
				onClick: onUploadPluginClick
			}
		],
		[onImportClick, onUploadPluginClick]
	);

	return <AppBarMenu icon={<PlusCircle />} items={items} />;
};

export default AddMenu;
