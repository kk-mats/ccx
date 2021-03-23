import React from "react";
import { Link } from "react-router-dom";
import {
	Theme,
	AppBar,
	Toolbar,
	Typography,
	useTheme,
	makeStyles,
	createStyles
} from "@material-ui/core";

import AddMenu from "components/molecules/app-bar/AddMenu";
import AccountMenu from "components/molecules/app-bar/AccountMenu";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		title: {
			flexGrow: 1,
			color: "white"
		},
		titleLink: {
			textDecoration: "none",
			"&:visited": {
				color: "inherit"
			}
		}
	})
);

type Props = {
	menuIcon?: React.ReactNode;
};

// eslint-disable-next-line react/display-name
const AppMenuBar: React.FunctionComponent<Props> = React.memo(
	({ menuIcon }) => {
		const classes = useStyles(useTheme());

		return (
			<AppBar position="fixed">
				<Toolbar>
					{menuIcon}
					<Typography variant="h6" noWrap className={classes.title}>
						<Link to="/home" className={classes.titleLink}>
							CCX
						</Link>
					</Typography>
					<AddMenu />
					<AccountMenu />
				</Toolbar>
			</AppBar>
		);
	}
);

export default AppMenuBar;
