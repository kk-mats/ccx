import React from "react";
import useSWR from "swr";

import { GetResponse, route } from "common/auth-client/api/v1/session";

import reducer, { defaultState } from "reducers/authReducer";
import AuthContext from "contexts/AuthContext";
import { jsonFetcher } from "utils/fetcher";

type Props = {
	children: React.ReactNode;
};

const AuthProvider: React.FunctionComponent<Props> = (props: Props) => {
	const { children } = props;
	const { data } = useSWR(route(), async (url: string) => {
		const r = await jsonFetcher<GetResponse>({ throwHttpErrors: false })(
			url
		);
		if (!r.error) {
			return r.userId;
		}
		return { failed: true };
	});
	const value = React.useReducer(reducer, {
		userId: data === undefined || typeof data === "object" ? null : data
	});

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

export default AuthProvider;
