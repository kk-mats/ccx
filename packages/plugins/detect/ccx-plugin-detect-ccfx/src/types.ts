export type QueryParameters = {
	directory: string;
	revision: string;
	language: string;
	b: number;
	t: number;
	w: string;
	l?: string[];
	is?: string;
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
};

export type DetectionResult = {
	clonePairs: ClonePair[];
};

export type CCFXFile = {
	id: number;
	path: string;
};

export type CCFXFragment = {
	file: CCFXFile;
	tokenBegin: number;
	tokenEnd: number;
};

export type CCFXClonePair = {
	f1: CCFXFragment;
	f2: CCFXFragment;
};
