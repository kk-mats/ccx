import React from "react";

import { MappingResult } from "common/all/types/EDetectionResult";

export type State = {
	base: string;
	comparing: string;
	revision: string;
	result: MappingResult;
};

const MappingResultContext = React.createContext<State>({} as State);

export default MappingResultContext;
