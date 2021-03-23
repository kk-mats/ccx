import React from "react";

import { State, Action } from "reducers/resultBiasReducer";

export { State, Action };

const SingleResultContext = React.createContext<
	[State, React.Dispatch<Action>]
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>([(undefined as unknown) as State, (): void => {}]);

export default SingleResultContext;
