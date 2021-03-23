import * as t from "io-ts";

import { brand, detectRequest } from "common/all/codecs";
import { internalJobEntityId } from "common/server-only/codecs";

export const artifactPath = brand(t.string, "ArtifactPath");

export const detectorServerRequest = t.type({
	id: internalJobEntityId,
	query: detectRequest
});

export const rawFragment = t.type({
	file: t.string,
	begin: t.number,
	end: t.number
});

export const rawClonePair = t.intersection([
	t.type({
		f1: rawFragment,
		f2: rawFragment
	}),
	t.partial({
		similarity: t.number
	})
]);

export const rawCloneSet = t.type({
	fragments: t.array(rawFragment)
});

export const rawDetectionResult = t.intersection([
	t.partial({
		extensions: t.UnknownRecord
	}),
	t.union([
		t.intersection([
			t.type({
				clonePairs: t.array(rawClonePair)
			}),
			t.partial({
				cloneSets: t.undefined
			})
		]),
		t.intersection([
			t.partial({
				clonePairs: t.undefined
			}),
			t.type({
				cloneSets: t.array(rawCloneSet)
			})
		])
	])
]);
