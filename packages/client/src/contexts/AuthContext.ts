import React from "react";

import { State, defaultState, Action } from "reducers/authReducer";

export { State, Action };

const AuthContext = React.createContext<
	[State, React.Dispatch<Action>]
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>([defaultState, (): void => {}]);

export default AuthContext;
