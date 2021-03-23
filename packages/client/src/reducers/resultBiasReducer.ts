import ClonePair from "common/all/types/ClonePair";
import File from "common/all/types/File";
import FileId from "common/all/types/FileId";
import FilePath from "common/all/types/FilePath";
import NormalizedDetectionResultBody from "common/all/types/NormalizedDetectionResultBody";

import BiasedClonePair from "types/BiasedClonePair";

export type State = {
	normalized: NormalizedDetectionResultBody;
	base: File;
	biased: Record<number, BiasedClonePair>;
};

export type Action =
	| {
			type: "set-base-file-id";
			payload: {
				fileId: FileId;
			};
	  }
	| {
			type: "set-base-file";
			payload: {
				path: string;
			};
	  };

const biasClonePairs = (
	fileId: FileId,
	clonePairs: Record<number, ClonePair>
): Record<number, BiasedClonePair> => {
	const biasedClonePairs: Record<number, BiasedClonePair> = {};

	Object.values(clonePairs).forEach((cp) => {
		if (cp.f1.file === fileId) {
			biasedClonePairs[cp.id] = {
				id: cp.id,
				f: cp.f1,
				paired: cp.f2
			};
		} else if (cp.f2.file === fileId) {
			biasedClonePairs[cp.id] = {
				id: cp.id,
				f: cp.f2,
				paired: cp.f1
			};
		}
	});

	return biasedClonePairs;
};

export const defaultState: (args: {
	base: File;
	normalized: NormalizedDetectionResultBody;
}) => State = ({ normalized, base }) => ({
	normalized,
	base,
	biased: biasClonePairs(base.id, normalized.clonePairs)
});

const reducer = (state: State, action: Action): State => {
	console.log(action);
	switch (action.type) {
		case "set-base-file-id": {
			return {
				...state,
				base: state.normalized.files[action.payload.fileId],
				biased: biasClonePairs(
					action.payload.fileId,
					state.normalized.clonePairs
				)
			};
		}

		case "set-base-file": {
			const file = Object.values(state.normalized.files).find(
				(value) => value.path === action.payload.path
			);

			if (file) {
				return {
					...state,
					base: file,
					biased: biasClonePairs(file.id, state.normalized.clonePairs)
				};
			}
			return state;
		}

		default: {
			return state;
		}
	}
};

export default reducer;
