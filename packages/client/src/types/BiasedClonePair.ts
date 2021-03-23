import Fragment from "common/all/types/Fragment";
import ClonePairId from "common/all/types/ClonePairId";

type BiasedClonePair = {
	id: ClonePairId;
	f: Fragment;
	paired: Fragment;
};

export default BiasedClonePair;
