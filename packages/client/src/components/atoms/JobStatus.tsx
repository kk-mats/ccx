import React from "react";
import {
	Box,
	BoxProps,
	Theme,
	useTheme,
	makeStyles,
	createStyles,
	SvgIconTypeMap
} from "@material-ui/core";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import {
	CheckboxMarkedCircleOutline,
	AlertCircleOutline,
	ArrowRightDropCircleOutline,
	Update
} from "mdi-material-ui";

import JobStatusType from "common/all/types/JobStatus";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			fontSize: theme.typography.h5.fontSize,
			color: "white",
			textTransform: "uppercase",
			display: "inline-flex",
			alignItems: "center",
			paddingTop: theme.spacing(1),
			paddingBottom: theme.spacing(1),
			paddingLeft: theme.spacing(3),
			paddingRight: theme.spacing(3)
		},
		icon: {
			fontSize: "inherit",
			marginRight: theme.spacing(1)
		}
	})
);

type Props = {
	status: JobStatusType;
};

type ComponentProps = Props & {
	Icon: OverridableComponent<SvgIconTypeMap>;
	color: "success.main" | "error.main" | "info.main" | "warning.main";
};

/*
const statusSx = (color: ComponentProps["color"]): BoxProps["sx"] => ({
	bgcolor: color,
	borderRadius: "borderRadius"
});
*/

const Component: React.FunctionComponent<ComponentProps> = (
	props: ComponentProps
) => {
	const { Icon, color, status } = props;
	const classes = useStyles(useTheme());

	return (
		<Box
			className={classes.root}
			bgcolor={color}
			borderRadius="borderRadius"
		>
			<Icon className={classes.icon} />
			{status}
		</Box>
	);
};

const JobStatus: React.FunctionComponent<Props> = (props: Props) => {
	const { status } = props;

	if ((status as string) === "Succeeded") {
		return (
			<Component
				Icon={CheckboxMarkedCircleOutline}
				color="success.main"
				status={status}
			/>
		);
	}

	if ((status as string) === "Failed") {
		return (
			<Component
				Icon={AlertCircleOutline}
				color="error.main"
				status={status}
			/>
		);
	}

	if ((status as string) === "Running") {
		return (
			<Component
				Icon={ArrowRightDropCircleOutline}
				color="warning.main"
				status={status}
			/>
		);
	}

	return <Component Icon={Update} color="info.main" status={status} />;
};

export default JobStatus;
