import React from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import { MappingResult } from "common/all/types/EDetectionResult";

import api from "utils/api";
import disableRevalidate from "utils/disableRevalidate";
import MappingResultContext from "contexts/MappingResultContext";
import useQueryParam from "hooks/useQueryParam";

type Props = {
	children: React.ReactNode;
};

const useDiffParams = () => {
	const params = useQueryParam();
	return React.useMemo(() => {
		return {
			base: params.get("b"),
			comparing: params.get("c"),
			revision: params.get("r")
		};
	}, [params]);
};

const MappingResultProvider: React.FunctionComponent<Props> = ({
	children
}) => {
	const { project } = useParams<Record<"project", string>>();
	const { base, comparing, revision } = useDiffParams();
	const { data } = useSWR(
		() => {
			if (base && comparing && revision) {
				return `projects/${project}/compare?base=${base}&comparing=${comparing}`;
			}
			return null;
		},
		(url) => {
			return api
				.get(url, {
					timeout: false
				})
				.json<MappingResult>();
		},
		disableRevalidate
	);

	const value = React.useMemo(
		() => ({
			base: base ?? "_",
			comparing: comparing ?? "_",
			revision: revision ?? "_",
			result: data ?? ({} as MappingResult)
		}),
		[base, comparing]
	);

	if (!data) {
		return <></>;
	}

	return (
		<MappingResultContext.Provider value={value}>
			{children}
		</MappingResultContext.Provider>
	);
};

export default MappingResultProvider;
