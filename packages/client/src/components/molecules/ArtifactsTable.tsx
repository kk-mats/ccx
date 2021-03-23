import React from "react";
import { useHistory, useParams } from "react-router-dom";
import {
	Box,
	Table,
	TableContainer,
	TableRow,
	TableCell,
	TableHead,
	TableBody,
	Toolbar,
	Checkbox,
	IconButton
} from "@material-ui/core";
import { CloudDownload } from "mdi-material-ui";

import Artifact from "common/all/types/Artifact";

type Props = {
	file: string;
	selected: boolean;
	toggleSelected: React.MouseEventHandler;
};

const ArtifactsTableRow: React.FunctionComponent<Props> = (props: Props) => {
	const { file, selected, toggleSelected } = props;
	const { project, historyId } = useParams<{
		project: string;
		historyId: string;
	}>();

	return (
		<TableRow hover selected={selected}>
			{/* <TableCell padding="checkbox" onClick={toggleSelected}>
				<Checkbox checked={selected} />
			</TableCell> */}
			<TableCell onClick={toggleSelected}>{file}</TableCell>
			<TableCell padding="checkbox" align="right">
				<IconButton
					download
					component="a"
					href={`${process.env.URL_BASE}api/projects/${project}/histories/${historyId}/artifacts/${file}`}
				>
					<CloudDownload />
				</IconButton>
			</TableCell>
		</TableRow>
	);
};

const toSelectedStateObject = (
	files: string[],
	initialValue = false
): { [K: string]: boolean } => {
	if (files.length === 0) {
		return {};
	}

	return files
		.map((file) => ({ [file]: initialValue }))
		.reduce((p, c) => ({ ...p, ...c }));
};

type P = {
	files: Artifact[];
};

const ArtifactsTable: React.FunctionComponent<P> = (props: P) => {
	const { files } = props;
	// {[file[0]]: false, [file[1]]: false, ..., [file[n]]: false}
	const [selected, setSelected] = React.useState(
		toSelectedStateObject(files)
	);

	const toggleSelected = (file: string): React.MouseEventHandler => {
		return (): void =>
			setSelected({
				...selected,
				[file]: !selected[file]
			});
	};

	return (
		<>
			<TableContainer>
				<Table>
					<TableBody>
						{files.map((file) => (
							<ArtifactsTableRow
								key={file}
								file={file}
								selected={selected[file]}
								toggleSelected={toggleSelected(file)}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
};

export default ArtifactsTable;
