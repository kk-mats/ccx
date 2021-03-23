import * as t from "io-ts";
import DetectionResult from "common/all/types/DetectionResult";
import Environment from "common/all/types/Environment";
import Extensions from "common/all/types/Extensions";
import File from "common/all/types/File";
import FileId from "common/all/types/FileId";
import Position from "common/all/types/Position";
import Similarity from "common/all/types/Similarity";
import ClonePair from "common/all/types/ClonePair";
import ClonePairId from "common/all/types/ClonePairId";
import compareFragment from "common/all/utils/compareFragment";
import {
	rawClonePair,
	rawCloneSet,
	rawDetectionResult,
	rawFragment
} from "domain/codecs";
import { DetectQuery } from "domain/client/WorkerClient";
import { Plugin } from "common/all/types/plugin";

type RawFragment = t.TypeOf<typeof rawFragment>;
type RawClonePair = t.TypeOf<typeof rawClonePair>;
type RawCloneSet = t.TypeOf<typeof rawCloneSet>;
export type RawDetectionResult = t.TypeOf<typeof rawDetectionResult>;

const compareRawFragment = (a: RawFragment, b: RawFragment) => {
	const fileComp = a.file.localeCompare(b.file);
	if (fileComp < 0) {
		return -1;
	}
	if (fileComp === 0) {
		if (a.begin < b.begin) {
			return -1;
		}
		if (a.begin === b.begin) {
			if (a.end < b.end) {
				return -1;
			}
			if (a.end === b.end) {
				return 0;
			}
		}
	}
	return 1;
};

class RawClonePairSet {
	private hashMap: Record<string, RawClonePair> = {};

	public addClonePair(clonePair: RawClonePair): void {
		const p = { ...clonePair };
		const comp = compareRawFragment(clonePair.f1, clonePair.f2);
		if (comp === 0) {
			return;
		}
		if (comp > 0) {
			p.f1 = clonePair.f2;
			p.f2 = clonePair.f1;
		}

		const hash = `${p.f1.file}_${p.f1.begin}_${p.f2.end}@${p.f2.file}_${p.f2.begin}_${p.f2.end}`;
		if (this.hashMap[hash] !== undefined) {
			return;
		}
		this.hashMap[hash] = p;
	}

	public addCloneSet(cloneSet: RawCloneSet): void {
		const { length } = cloneSet.fragments;

		if (length < 2) {
			return;
		}

		cloneSet.fragments.forEach((from, fromIndex) => {
			if (length - fromIndex < 2) {
				return;
			}

			cloneSet.fragments.slice(fromIndex + 1).forEach((paired) =>
				this.addClonePair({
					f1: from,
					f2: paired
				})
			);
		});
	}

	public toArray(): RawClonePair[] {
		const values = Object.values(this.hashMap);
		return values;
	}
}

export const createDetectionResult = (
	raw: RawDetectionResult,
	plugin: Plugin,
	args: DetectQuery["args"]
): DetectionResult => {
	const fileMap: Record<string, FileId> = {};
	const clonePairSet = new RawClonePairSet();

	if (raw.clonePairs !== undefined) {
		raw.clonePairs.forEach((p) => clonePairSet.addClonePair(p));
	} else {
		raw.cloneSets.forEach((cloneSet) => clonePairSet.addCloneSet(cloneSet));
	}

	const rawClonePairs = clonePairSet.toArray();
	Array.from(
		new Set(rawClonePairs.flatMap(({ f1, f2 }) => [f1.file, f2.file]))
	)
		.sort()
		.forEach((f, index) => {
			fileMap[f] = index as FileId;
		});

	const clonePairs: ClonePair[] = rawClonePairs
		.map((p) => {
			const f1 = {
				file: fileMap[p.f1.file],
				begin: p.f1.begin as Position,
				end: p.f1.end as Position
			};
			const f2 = {
				file: fileMap[p.f2.file],
				begin: p.f2.begin as Position,
				end: p.f2.end as Position
			};
			return {
				similarity: p.similarity as Similarity | undefined,
				f1,
				f2
			};
		})
		.sort((a, b) => {
			const f1 = compareFragment(a.f1, b.f1);
			if (f1 < 0) {
				return -1;
			}
			if (f1 === 0) {
				return compareFragment(a.f2, b.f2);
			}
			return 1;
		})
		.map((p, index) => ({
			...p,
			id: index as ClonePairId
		}));

	const environment: Environment = {
		detector: plugin.name,
		version: args.detectorVersion,
		parameters: args.parameters
	};

	return {
		environment,
		extensions: raw.extensions as Extensions,
		files: Object.entries(fileMap).map(([path, id]) => ({
			path: path.replace(/\\/g, "/"),
			id
		})) as File[],
		clonePairs
	};
};
