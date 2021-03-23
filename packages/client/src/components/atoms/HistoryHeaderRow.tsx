import React from "react";
import {
	Grid,
	ListItem,
	ListItemIcon,
	ListItemText,
	SvgIconTypeMap,
	Typography
} from "@material-ui/core";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";

type Props = {
	Icon: OverridableComponent<SvgIconTypeMap>;
	title: string;
	body: React.ReactNode;
};

const HistoryHeaderRow: React.FunctionComponent<Props> = (props: Props) => {
	const { Icon, title, body } = props;
	return (
		<ListItem>
			<ListItemIcon style={{ minWidth: "2.2em" }}>
				<Icon />
			</ListItemIcon>
			<ListItemText
				primary={
					<Grid
						container
						spacing={2}
						wrap="nowrap"
						alignItems="center"
					>
						<Grid item style={{ minWidth: "5.5em" }}>
							{title}
						</Grid>
						<Grid item zeroMinWidth>
							<Typography noWrap style={{ fontSize: "inherit" }}>
								{body}
							</Typography>
						</Grid>
					</Grid>
				}
				primaryTypographyProps={{ noWrap: true }}
			/>
		</ListItem>
	);
};

export default HistoryHeaderRow;
