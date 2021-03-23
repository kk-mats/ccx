import React from "react";
import { useParams } from "react-router-dom";
import {
	Tooltip,
	IconButton,
	ClickAwayListener,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListItemSecondaryAction,
	makeStyles
} from "@material-ui/core";
import { HelpCircleOutline } from "mdi-material-ui";

import { Config } from "reducers/detectionFormReducer";

import { DetectionParameterDef } from "common/all/types/parameters";

import DetectionFormSection from "components/molecules/detection-form/DetectionFormSection";
import DirectoryParameterField from "components/molecules/detection-form/DirectoryParameterField";
import RevisionParameterField from "components/molecules/detection-form/RevisionParameterField";
import { InputParameterField } from "components/molecules/detection-form/InputParameterField";
import { NumberParameterField } from "components/molecules/detection-form/NumberParameterField";
import { VariantParameterField } from "components/molecules/detection-form/VariantParameterField";
import SwitchParameterField from "components/molecules/detection-form/SwitchParameterField";
import { OptionalParameterField } from "components/molecules/detection-form/OptionalParameterField";
import { DetectionFormDispatchContext } from "contexts/DetectionFormDispatchContext";

const useStyles = makeStyles(() => ({
	switch: {
		float: "right"
	}
}));

type PureParameterFieldProps = {
	pKey: string;
	def: DetectionParameterDef;
	children: React.ReactNode;
};
const PureParameterField: React.FunctionComponent<PureParameterFieldProps> = ({
	pKey,
	def,
	children
}) => (
	<>
		<ListItemIcon />
		<ListItemText
			disableTypography
			primary={def.label ?? pKey}
			secondary={children}
		/>
	</>
);

type ParameterFieldProps = {
	pKey: string;
	config: Config;
};

const ParameterField: React.FunctionComponent<ParameterFieldProps> = ({
	pKey,
	config
}) => {
	const { project } = useParams<Record<"project", string>>();
	const value = config.formValues.parameters[pKey];
	const error = config.formState.errors[pKey];
	const classes = useStyles();

	const [open, setOpen] = React.useState(false);

	const def = config.variant.parameters[pKey];
	const toggleOpen = () => setOpen(!open);
	const onClose = React.useCallback(() => setOpen(false), [setOpen]);
	const dispatch = React.useContext(DetectionFormDispatchContext);

	const child = React.useMemo(() => {
		switch (def.type) {
			case "directory": {
				return (
					<PureParameterField pKey={pKey} def={def}>
						<DirectoryParameterField
							pKey={pKey}
							value={value}
							error={error}
							project={project}
							revision={
								config.formValues.parameters[def.rule.revision]
							}
							dispatch={dispatch}
							validateRepositoryPath={
								config.formState.validateRepositoryPath
							}
						/>
					</PureParameterField>
				);
			}
			case "variant": {
				return (
					<PureParameterField pKey={pKey} def={def}>
						<VariantParameterField
							pKey={pKey}
							value={value}
							rule={def.rule}
							dispatch={dispatch}
						/>
					</PureParameterField>
				);
			}
			case "revision": {
				return (
					<PureParameterField pKey={pKey} def={def}>
						<RevisionParameterField
							pKey={pKey}
							value={value}
							error={error}
							project={project}
							dispatch={dispatch}
							validateRepositoryPath={
								config.formState.validateRepositoryPath
							}
						/>
					</PureParameterField>
				);
			}
			case "input": {
				return (
					<PureParameterField pKey={pKey} def={def}>
						<InputParameterField
							pKey={pKey}
							value={value}
							rule={def.rule}
							error={error}
							dispatch={dispatch}
						/>
					</PureParameterField>
				);
			}
			case "switch": {
				return (
					<PureParameterField pKey={pKey} def={def}>
						<SwitchParameterField
							className={classes.switch}
							pKey={pKey}
							value={value}
							error={error}
							dispatch={dispatch}
						/>
					</PureParameterField>
				);
			}

			case "optional": {
				return (
					<OptionalParameterField
						pKey={pKey}
						value={value}
						def={def}
						error={error}
						project={project}
						values={config.formValues.parameters}
						dispatch={dispatch}
						validateRepositoryPath={
							config.formState.validateRepositoryPath
						}
					/>
				);
			}
			// type==="int" || type==="float"
			default: {
				return (
					<PureParameterField pKey={pKey} def={def}>
						<NumberParameterField
							pKey={pKey}
							value={value}
							rule={def.rule}
							error={error}
							dispatch={dispatch}
						/>
					</PureParameterField>
				);
			}
		}
	}, [pKey, config.formValues.parameters, def, config, value, dispatch]);

	if (def.description) {
		return (
			<ListItem>
				{child}
				<ListItemSecondaryAction>
					<ClickAwayListener onClickAway={onClose}>
						<Tooltip
							key={pKey}
							arrow
							disableFocusListener
							disableHoverListener
							disableTouchListener
							open={open}
							title={def.description}
							onClose={onClose}
						>
							<IconButton
								edge="end"
								color={open ? "secondary" : undefined}
								onClick={toggleOpen}
							>
								<HelpCircleOutline />
							</IconButton>
						</Tooltip>
					</ClickAwayListener>
				</ListItemSecondaryAction>
			</ListItem>
		);
	}

	return (
		<ListItem>
			{child}
			<ListItemSecondaryAction />
		</ListItem>
	);
};

type Props = {
	config: Config;
};

const DetectionFormParametersSection: React.FunctionComponent<Props> = ({
	config
}) => {
	return (
		<DetectionFormSection title="Parameters">
			<List dense>
				{config.variant.pKeys.map((pKey) => (
					<ParameterField key={pKey} pKey={pKey} config={config} />
				))}
			</List>
		</DetectionFormSection>
	);
};
export default DetectionFormParametersSection;
