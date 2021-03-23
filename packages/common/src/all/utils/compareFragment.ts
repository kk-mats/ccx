import Fragment from "../types/Fragment";

const compareFragment = (a: Fragment, b: Fragment): number => {
	if (a.file < b.file) {
		return -1;
	}
	if (a.file === b.file) {
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

export default compareFragment;
