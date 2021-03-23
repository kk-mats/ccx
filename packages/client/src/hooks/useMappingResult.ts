import React from "react";
import MappingResultContext, { State } from "contexts/MappingResultContext";

const useMappingResult = (): State => React.useContext(MappingResultContext);

export default useMappingResult;
