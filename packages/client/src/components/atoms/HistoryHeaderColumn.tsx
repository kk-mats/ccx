import React from "react";
import { Grid, List } from "@material-ui/core";

type Props = {
	children: React.ReactNode;
};

const HistoryHeaderColumn: React.FunctionComponent<Props> = (props: Props) => {
	const { children } = props;
	return (
		<Grid item md={12} lg={4}>
			<List dense>{children}</List>
		</Grid>
	);
};

export default HistoryHeaderColumn;
