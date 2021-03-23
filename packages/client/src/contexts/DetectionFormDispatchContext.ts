import React from "react";
import { Action } from "reducers/detectionFormReducer";

export type DetectionFormDispatchAction = Action;

export const DetectionFormDispatchContext = React.createContext<
	React.Dispatch<Action>
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});
