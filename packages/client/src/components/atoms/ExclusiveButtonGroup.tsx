import React from "react";

import { useTheme, makeStyles, ButtonGroup, Button } from "@material-ui/core";

type Props = {
	buttons: {
		component: React.ReactNode;
		onClick: React.MouseEventHandler<HTMLButtonElement>;
	}[];
};

const useStyles = makeStyles((theme) => ({
	disabled: {
		"&:disabled": {
			color: "#fff",
			backgroundColor: theme.palette.secondary.main
		}
	}
}));

const ExclusiveButtonGroup: React.FunctionComponent<Props> = (props: Props) => {
	const { buttons } = props;
	const [selected, setSelected] = React.useState(0);

	const classes = useStyles(useTheme());

	return (
		<ButtonGroup variant="outlined">
			{buttons.map((button, index) => (
				// eslint-disable-next-line react/jsx-key
				<Button
					className={classes.disabled}
					disabled={index === selected}
					onClick={(event): void => {
						setSelected(index);
						button.onClick(event);
					}}
				>
					{button.component}
				</Button>
			))}
		</ButtonGroup>
	);
};

export default ExclusiveButtonGroup;
