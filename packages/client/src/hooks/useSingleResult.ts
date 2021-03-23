import React from "react";
import SingleResultContext, {
	State,
	Action
} from "contexts/SingleResultContext";

const useSingleResult = (): [State, React.Dispatch<Action>] =>
	React.useContext(SingleResultContext);

export { State };

export default useSingleResult;
