import React from "react";
import { useHistory } from "react-router-dom";
import { AccountCircle } from "mdi-material-ui";

import AuthContext from "contexts/AuthContext";
import AppBarMenu from "components/atoms/AppBarMenu";
import { promise } from "apis/session/signOut";

const AccountMenu: React.FunctionComponent = () => {
	const history = useHistory();
	const [, dispatch] = React.useContext(AuthContext);

	const onProjectsClick = (): void => {
		history.push("/home");
	};

	const onLogoutClick = (): void => {
		promise({
			throwHttpErrors: false
		})().then(() => {
			dispatch({
				type: "sign-out"
			});
			history.push("/login");
		});
	};

	const items = [
		{
			label: "Projects",
			onClick: onProjectsClick
		},
		{
			label: "Logout",
			onClick: onLogoutClick
		}
	];

	return <AppBarMenu icon={<AccountCircle />} items={items} />;
};

export default AccountMenu;
