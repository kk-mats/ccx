import api from "utils/api";

import {
	PostRequest,
	PostResponse,
	route
} from "common/auth-client/api/v1/projects/_projectName/histories";

import FetchOptions from "types/FetchOptions";

const dispatchDetection = async (
	project: string,
	request: PostRequest,
	options?: FetchOptions
): Promise<PostResponse> => {
	const response = await api.post(route(project), {
		json: request,
		...options
	});
	if (response.ok || response.status < 500) {
		return response.json();
	}

	throw response;
};

export { PostRequest as Request, PostResponse as Response };

export default dispatchDetection;
