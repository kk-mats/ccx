import api from "utils/api";

import {
	PostRequest,
	PostResponse,
	route
} from "common/auth-client/api/v1/user/check";

import ResourceKyOptions from "types/FetchOptions";

export const checkUserId = async (
	request: PostRequest,
	options?: ResourceKyOptions
): Promise<PostResponse> => {
	const response = await api.post(route(), {
		json: request,
		...options
	});
	if (response.ok || response.status === 409) {
		return response.json();
	}
	throw response;
};

export { PostRequest as Request, PostResponse as Response };

export default checkUserId;
