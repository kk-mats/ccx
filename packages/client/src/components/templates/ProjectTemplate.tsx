import React from "react";
import { useParams } from "react-router-dom";

import {
	LinearProgress,
	Theme,
	useTheme,
	makeStyles,
	createStyles,
	IconButton
} from "@material-ui/core";
import { Menu } from "mdi-material-ui";

import ProjectPageHeader from "components/molecules/ProjectPageHeader";
import AppMenuBar from "components/organisms/AppMenuBar";
import ProjectDrawer from "components/organisms/ProjectDrawer";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: "flex"
		},
		wrap: {
			flexGrow: 1,
			display: "flex",
			flexDirection: "column",
			height: "100vh",
			width: "100vw"
		},
		content: {
			flex: "1 1 100%",
			height: 0
		},
		toolbar: theme.mixins.toolbar,
		menuButton: {
			marginRight: theme.spacing(2)
		}
	})
);

type Props = {
	children: React.ReactNode;
};

const ProjectTemplate: React.FunctionComponent<Props> = (props: Props) => {
	const { children } = props;
	const classes = useStyles(useTheme());
	const { project } = useParams<{ project: string }>();

	const [open, setOpen] = React.useState(false);
	const onOpen = React.useCallback(() => setOpen(true), [setOpen]);
	const onClose = React.useCallback(() => setOpen(false), [setOpen]);

	const menuIcon = React.useMemo(
		() => (
			<IconButton
				className={classes.menuButton}
				color="inherit"
				edge="start"
				onClick={onOpen}
			>
				<Menu />
			</IconButton>
		),
		[onOpen]
	);

	return (
		<div className={classes.root}>
			<AppMenuBar menuIcon={menuIcon} />
			<ProjectDrawer project={project} open={open} onClose={onClose} />
			<main className={classes.wrap}>
				<div className={classes.toolbar} />
				<div className={classes.content}>
					<React.Suspense
						fallback={<LinearProgress color="secondary" />}
					>
						{children}
					</React.Suspense>
				</div>
			</main>
		</div>
	);
};

export default ProjectTemplate;
