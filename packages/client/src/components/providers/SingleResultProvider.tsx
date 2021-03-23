import React from "react";
import { useParams, useLocation } from "react-router-dom";
import useSWR from "swr";

import {
	GetResponse,
	route
} from "common/auth-client/api/v1/projects/_projectName/histories/_historyId/result/body";

import reducer, { defaultState } from "reducers/resultBiasReducer";
import SingleResultContext from "contexts/SingleResultContext";
import { jsonFetcher } from "utils/fetcher";

type Props = {
	children: React.ReactNode;
};

const SingleResultProvider: React.FunctionComponent<Props> = (props: Props) => {
	const { children } = props;
	const { pathname } = useLocation();
	const { project, historyId, resultId } = useParams<
		Record<"project" | "historyId" | "resultId", string>
	>();

	const { data } = useSWR(
		route(project, historyId, resultId),
		jsonFetcher<GetResponse>()
	);

	if (data === undefined || data.error) {
		throw data;
	}
	const [result, dispatch] = React.useReducer(reducer, data, (normalized) => {
		const split = pathname.split(
			`/home/${project}/history/${historyId}/result/${resultId}/`
		);
		if (split.length > 0) {
			const found = Object.values(data.files).find(
				(file) => file.path === split[1]
			);
			if (found) {
				return defaultState({ base: found, normalized });
			}
		}
		return defaultState({ base: data.files[0], normalized });
	});

	React.useEffect(() => {
		const split = pathname.split(
			`/home/${project}/history/${historyId}/result/${resultId}/`
		);
		if (split.length > 0) {
			dispatch({
				type: "set-base-file",
				payload: {
					path: split[1]
				}
			});
		}
	}, [project, historyId, pathname, dispatch]);

	return (
		<SingleResultContext.Provider value={[result, dispatch]}>
			{children}
		</SingleResultContext.Provider>
	);
};

export default SingleResultProvider;
