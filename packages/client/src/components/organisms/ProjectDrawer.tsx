import React from "react";
import { Link, useLocation } from "react-router-dom";

import {
	Theme,
	Drawer,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	useTheme,
	makeStyles,
	createStyles
} from "@material-ui/core";
import { Home, ChartBar, Close } from "mdi-material-ui";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		drawer: {
			width: drawerWidth,
			flexShrink: 0
		},
		drawerPaper: {
			width: drawerWidth
		},
		toolbar: theme.mixins.toolbar,
		nested: {
			paddingLeft: theme.spacing(4),
			backgroundColor: theme.palette.background.default
		},
		header: {
			display: "flex",
			alignItems: "center",
			padding: theme.spacing(0, 1),
			...theme.mixins.toolbar,
			justifyContent: "flex-end"
		}
	})
);

type Props = {
	project: string;
	open: boolean;
	onClose: () => void;
};

const ProjectDrawer: React.FunctionComponent<Props> = ({
	open,
	project,
	onClose
}) => {
	const classes = useStyles(useTheme());

	const { pathname } = useLocation();
	React.useEffect(() => {
		onClose();
		console.log("close drawer");
	}, [pathname, onClose]);

	return (
		<Drawer
			className={classes.drawer}
			anchor="left"
			open={open}
			onClose={onClose}
			classes={{
				paper: classes.drawerPaper
			}}
		>
			<div className={classes.header}>
				<IconButton onClick={onClose}>
					<Close />
				</IconButton>
			</div>
			<List>
				<ListItem button component={Link} to={`/home/${project}`}>
					<ListItemIcon>
						<Home />
					</ListItemIcon>
					<ListItemText primary={project} />
				</ListItem>
			</List>
			<Divider />

			<List>
				<ListItem>
					<ListItemIcon>
						<ChartBar />
					</ListItemIcon>
					<ListItemText primary="Analysis" />
				</ListItem>
				<List>
					<ListItem
						button
						component={Link}
						to={`/home/${project}/clone-detection`}
						className={classes.nested}
					>
						<ListItemText primary="Clone Detection" />
					</ListItem>
					<ListItem
						button
						component={Link}
						to={`/home/${project}/history`}
						className={classes.nested}
					>
						<ListItemText primary="History" />
					</ListItem>
					<ListItem
						button
						component={Link}
						to={`/home/${project}/diff`}
						className={classes.nested}
					>
						<ListItemText primary="Diff" />
					</ListItem>
					{/* <ListItem
						button
						component={Link}
						to={`/home/${project}/statistics`}
						className={classes.nested}
					>
						<ListItemText primary="Statistics" />
					</ListItem> */}
				</List>
			</List>
			<Divider />
			{/* <List>
				<ListItem>
					<ListItemIcon>
						<Database />
					</ListItemIcon>
					
					<ListItemText primary="Repository" />
				</ListItem>
				<List>
					<ListItem
						button
						component={Link}
						to={`/home/${project}/settings`}
						className={classes.nested}
					>
						<ListItemText primary="Settings" />
					</ListItem>
				</List>
			</List>
			<Divider /> */}
		</Drawer>
	);
};

export default ProjectDrawer;
