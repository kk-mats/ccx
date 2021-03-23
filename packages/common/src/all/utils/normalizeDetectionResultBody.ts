import DetectionResult from "../types/DetectionResult";
import NormalizedDetectionResultBody from "../types/NormalizedDetectionResultBody";
import ClonePair from "../types/ClonePair";
import File from "../types/File";

const normalizeDetectionResultBody = (
	result: DetectionResult
): NormalizedDetectionResultBody => {
	const files: Record<number, File> = {};
	const clonePairs: Record<number, ClonePair> = {};

	result.files.forEach((f) => {
		files[f.id] = f;
	});

	result.clonePairs.forEach((cp): void => {
		clonePairs[cp.id] = cp;
	});

	return {
		files,
		clonePairs
	};
};

export default normalizeDetectionResultBody;
