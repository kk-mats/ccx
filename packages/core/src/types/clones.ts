import * as t from "io-ts";
import {
	rawClonePair,
	rawCloneSet,
	rawDetectionResult,
	rawFragment
} from "domain/codecs";

export type RawClonePair = t.TypeOf<typeof rawClonePair>;

export type RawCloneSet = t.TypeOf<typeof rawCloneSet>;

export type RawDetectionResult = t.TypeOf<typeof rawDetectionResult>;

export type RawFragment = t.TypeOf<typeof rawFragment>;

export type RawEnvironment = {
	detector: string;
	version: string;
	parameters: Record<string, unknown>;
};
