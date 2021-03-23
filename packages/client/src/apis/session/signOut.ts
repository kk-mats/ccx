import api from "utils/api";

import { DeleteResponse, route } from "common/auth-client/api/v1/session";

import Resource from "types/Resource";
import ResourceKyOptions from "types/FetchOptions";

export const promise = (options?: ResourceKyOptions) => {
	return async (): Promise<DeleteResponse> => {
		console.log("deleting");
		const r = await api.delete(route(), {
			...options
		});
		if (r.ok) {
			return {};
		}

		return r.json();
	};
};

const signOut = (options?: ResourceKyOptions): Resource<DeleteResponse> => {
	return new Resource(promise(options));
};
export { DeleteResponse as Response };

export default signOut;
