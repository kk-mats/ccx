import FileId from "./FileId";
import FilePath from "./FilePath";
import ClonePair from "./ClonePair";
import ClonePairId from "./ClonePairId";
import Environment from "./Environment";
import DetectionResult from "./DetectionResult";

type EDetectionResult = {
	environment: Environment;
	files: Record<number, FilePath>;
	clonePairs: Record<number, ClonePair>;
};

export type MappingResult = {
	base: EDetectionResult;
	comparing: EDetectionResult;
	comparingToAllF: Record<number, FileId | undefined>;
	baseToComparing: Record<number, ClonePairId[]>;
	comparingToBase: Record<number, ClonePairId[]>;
	allGrids: Record<
		number,
		Record<
			number,
			{
				base: ClonePairId[];
				comparing: ClonePairId[];
			}
		>
	>;
	allFiles: Record<
		number,
		{
			path: FilePath;
			base?: FileId;
			comparing?: FileId;
		}
	>;
};

export const convertE = (result: DetectionResult): EDetectionResult => {
	const files: Record<number, FilePath> = {};
	const clonePairs: Record<number, ClonePair> = {};

	result.files.forEach((f) => {
		files[f.id] = f.path;
	});

	result.clonePairs.forEach((cp): void => {
		clonePairs[cp.id] = cp;
	});

	return {
		environment: result.environment,
		files,
		clonePairs
	};
};

// eslint-disable-next-line no-undef
export default EDetectionResult;
