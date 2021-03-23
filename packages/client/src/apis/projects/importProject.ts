import api from "utils/api";

import {
	PostRequest,
	PostResponse,
	route
} from "common/auth-client/api/v1/projects";

import FetchOptions from "types/FetchOptions";

export { PostResponse as Response, route };

const importProject = async (
	request: PostRequest,
	options?: FetchOptions
): Promise<PostResponse> => {
	const response = await api.post(route(), {
		...options,
		json: request,
		timeout: false,
		throwHttpErrors: false
	});
	if (response.ok || response.status < 500) {
		return response.json();
	}
	throw response;
};

export default importProject;
