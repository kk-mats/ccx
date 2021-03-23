import React from "react";
import { IconButton, Menu, MenuItem, MenuProps } from "@material-ui/core";

type Props = {
	icon: React.ReactNode;
	items: { label: string; onClick: () => void }[];
};

const AppBarMenu: React.FunctionComponent<Props> = (props: Props) => {
	const { icon, items } = props;

	const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

	const onIconClick: React.MouseEventHandler<HTMLElement> = (event) => {
		setAnchor(event.currentTarget);
	};

	const onClose = React.useCallback((): void => {
		setAnchor(null);
	}, [setAnchor]);

	return (
		<div>
			<IconButton onClick={onIconClick}>{icon}</IconButton>
			<Menu
				keepMounted
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={onClose}
			>
				{items.map(({ label, onClick }) => (
					<MenuItem
						key={label}
						onClick={(): void => {
							onClick();
							onClose();
						}}
					>
						{label}
					</MenuItem>
				))}
			</Menu>
		</div>
	);
};

export default AppBarMenu;
