const merge = <T extends object>(objects: T[]): T => {
	return objects.reduce((p, c) => ({
		...p,
		...c
	}));
};

export default merge;
