import FileId from "common/all/types/FileId";
import ClonePair from "common/all/types/ClonePair";

import BiasedClonePair from "types/BiasedClonePair";

const biasClonePairs = (
	fileId: FileId,
	clonePairs: ClonePair[]
): BiasedClonePair[] => {
	const biasedClonePairs: BiasedClonePair[] = [];

	clonePairs.forEach((cp) => {
		if (cp.f1.file === fileId) {
			biasedClonePairs.push({
				id: cp.id,
				f: cp.f1,
				paired: cp.f2
			});
		} else if (cp.f2.file === fileId) {
			biasedClonePairs.push({
				id: cp.id,
				f: cp.f2,
				paired: cp.f1
			});
		}
	});

	return biasedClonePairs;
};

export default biasClonePairs;
