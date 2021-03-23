export type QueryParameters = {
	d: string;
	revision: string;
	cs: string;
	l: string;
	sim?: number | null;
	size?: number | null;
	sizeb?: number | null;
	oc?: string | null;
	ot?: string | null;
	on?: string | null;
	ocs?: string | null;
};

export type Target = {
	directory: string;
	revision: string;
};

export type Query = {
	detectorVersion: string;
	targets: Target[];
	parameters: QueryParameters;
};

export type Fragment = {
	file: string;
	begin: number;
	end: number;
};

export type ClonePair = {
	f1: Fragment;
	f2: Fragment;
	similarity: number;
};

export type DetectionResult = {
	clonePairs: ClonePair[];
};
