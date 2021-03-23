import React from "react";
import {
	Button,
	ButtonProps,
	CircularProgress,
	Theme,
	makeStyles,
	createStyles
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrapper: {
			position: "relative"
		},
		buttonProgress: {
			position: "absolute",
			top: "50%",
			left: "50%",
			marginTop: -12,
			marginLeft: -12
		}
	})
);

type Props = Omit<ButtonProps, "onClick" | "children"> & {
	onClick: (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => Promise<void>;
	children: React.ReactNode;
};

const ProgressButton: React.FunctionComponent<Props> = (props: Props) => {
	const { onClick, children, disabled, ...others } = props;

	const classes = useStyles();
	const [loading, setLoading] = React.useState(false);

	const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (
		event
	): void => {
		setLoading(true);
		onClick(event).then(() => {
			setLoading(false);
		});
	};

	return (
		<div className={classes.wrapper}>
			<Button
				disabled={disabled || loading}
				color="secondary"
				onClick={handleButtonClick}
				// eslint-disable-next-line react/jsx-props-no-spreading
				{...others}
			>
				{children}
			</Button>
			{loading && (
				<CircularProgress
					size={24}
					className={classes.buttonProgress}
				/>
			)}
		</div>
	);
};

export default ProgressButton;
