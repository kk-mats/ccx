export type QueryParameters = {
	target: string;
	revision: string;
	language: string;
	minTokens: number[];
	stride: number[];
	similarity: number[];
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

export type CloneSet = {
	fragments: Fragment[];
};

export type DetectionResult = {
	parameters: Record<string, unknown>;
	cloneSets: CloneSet[];
};
