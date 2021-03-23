export type QueryParameters = {
	directory: string;
	revision: string;
	language: string;
	granularity: string;
	threshold: number;
	minsize: number;
	maxsize: number;
	transform?: string | null;
	rename: string;
	filter: string;
	abstract: string;
	normalize: string;
	cluster: boolean;
	report: boolean;
	include?: string | null;
	exclude?: string | null;
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

export type NiCadXMLSource = {
	file: string;
	startline: number;
	endline: number;
};

export type NiCadXMLClone = {
	similarity: number;
	source: NiCadXMLSource[];
};

export type NiCadXMLFormat = {
	clones: {
		clone: NiCadXMLClone[];
	};
};
