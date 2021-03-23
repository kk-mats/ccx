import React from "react";
import { Box, Grid } from "@material-ui/core";

import { Config } from "reducers/detectionFormReducer";
import ProgressButton from "components/atoms/ProgressButton";
import DetectionFormSection from "components/molecules/detection-form/DetectionFormSection";

const sx = { m: 1 };

type Props = {
	config: Config;
	onRunButtonClicked: (
		config: Config,
		event: React.MouseEvent<HTMLButtonElement>
	) => Promise<void>;
};

const ActionsSection: React.FunctionComponent<Props> = React.memo(
	({ config, onRunButtonClicked }) => {
		const onClick = React.useCallback(
			async (
				event: React.MouseEvent<HTMLButtonElement>
			): Promise<void> => {
				await onRunButtonClicked(config, event);
			},
			[config, onRunButtonClicked]
		);

		return (
			<DetectionFormSection>
				<Box m={1}>
					<Grid
						container
						component={undefined as any}
						spacing={2}
						justify="flex-end"
					>
						<Grid item>
							<ProgressButton
								type="submit"
								disabled={config.formState.disabled}
								variant="contained"
								onClick={onClick}
							>
								Run detector
							</ProgressButton>
						</Grid>
					</Grid>
				</Box>
			</DetectionFormSection>
		);
	}
);

export default ActionsSection;
