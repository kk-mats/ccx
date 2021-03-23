import api from "utils/api";

import {
	PostRequest,
	PostResponse,
	route
} from "common/auth-client/api/v1/user";

import Resource from "types/Resource";
import ResourceKyOptions from "types/FetchOptions";

const signUp = (
	request: PostRequest,
	options?: ResourceKyOptions
): Resource<PostResponse> => {
	const promise = async (): Promise<PostResponse> => {
		return api
			.post(route(), {
				json: request,
				...options
			})
			.json<PostResponse>();
	};

	return new Resource(promise);
};

export const promise = async (
	request: PostRequest,
	options?: ResourceKyOptions
): Promise<PostResponse> => {
	const response = await api
		.post(route(), {
			json: request,
			...options
		})
		.json<PostResponse>();

	return response;
};

export { PostRequest as Request, PostResponse as Response };

export default signUp;
