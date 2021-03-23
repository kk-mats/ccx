import FetchOptions from "types/FetchOptions";
import api from "utils/api";

type ResponseHooks = {
	[P: number]: (res: Response) => Response;
	other?: (res: Response) => Response;
};

const fetcher = (
	options?: FetchOptions,
	responseHooks?: ResponseHooks
): ((url: string) => Promise<Response>) => async (
	url: string
): Promise<Response> =>
	api(url, {
		...options,
		hooks: {
			afterResponse: [
				(request, option, response): Response => {
					if (responseHooks) {
						if (responseHooks && response.status in responseHooks) {
							return responseHooks[response.status](response);
						}
						if (responseHooks.other) {
							return responseHooks.other(response);
						}
					}
					return response;
				}
			]
		}
	});

export const jsonFetcher = <R>(
	options?: FetchOptions,
	responseHooks?: ResponseHooks
): ((url: string) => Promise<R>) => async (url: string): Promise<R> =>
	(await fetcher(options, responseHooks)(url)).json();

export const textFetcher = (
	options?: FetchOptions,
	responseHooks?: ResponseHooks
): ((url: string) => Promise<string>) => async (url: string): Promise<string> =>
	(await fetcher(options, responseHooks)(url)).text();

export default fetcher;
