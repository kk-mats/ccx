import useSWR, { keyInterface } from "swr";
import { useHistory, useLocation } from "react-router-dom";
import FetchOptions from "types/FetchOptions";
import api from "utils/api";

type ResponseHandler = (res: Response) => Response;

export const useDefaultHandler = (): ResponseHandler => {
	const history = useHistory();
	return (res): Response => {
		if (res.status === 403) {
			history.push("/login");
		}
		return res;
	};
};

export const useFetcher = (
	url: keyInterface,
	options?: FetchOptions,
	handler?: ResponseHandler
): Response | undefined => {
	const { data } = useSWR(
		url,
		(u: string): Promise<Response> => api(u, options)
	);

	if (data && handler) {
		return handler(data);
	}
	return data;
};

export const useJsonFetcher = <R>(
	url: keyInterface,
	options?: FetchOptions,
	handler?: ResponseHandler
): R | undefined => {
	const { data } = useSWR<R | undefined>(
		url,
		async (u: string): Promise<R | undefined> => {
			const res = await api(u, options);
			if (handler) {
				return handler(res).json();
			}
			return res.json();
		}
	);
	return data;
};
