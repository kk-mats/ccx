import { cache } from "swr";

export type State = {
	userId: string | null;
};

export type Action =
	| {
			type: "sign-in";
			payload: {
				userId: string;
			};
	  }
	| {
			type: "sign-out";
	  };

export const defaultState: State = {
	userId: null
};

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case "sign-in": {
			return {
				userId: action.payload.userId
			};
		}

		case "sign-out": {
			cache.clear();
			return {
				userId: null
			};
		}

		default: {
			return state;
		}
	}
};

export default reducer;
