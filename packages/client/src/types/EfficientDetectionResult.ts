import FilePath from "common/all/types/FilePath";
import ClonePair from "common/all/types/ClonePair";
import DetectionResult from "common/all/types/DetectionResult";

export type EDetectionResult = Omit<DetectionResult, "files" | "clonePairs"> & {
	files: Record<number, FilePath>;
	clonePairs: Record<number, ClonePair>;
};

export const convertE = (result: DetectionResult): EDetectionResult => {
	const files: Record<number, FilePath> = {};
	const clonePairs: Record<number, ClonePair> = {};
	result.files.forEach((file) => {
		files[file.id] = file.path;
	});
	result.clonePairs.forEach((clonePair) => {
		clonePairs[clonePair.id] = clonePair;
	});

	return {
		...result,
		files,
		clonePairs
	};
};
