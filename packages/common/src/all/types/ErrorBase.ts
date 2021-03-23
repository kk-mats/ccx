import * as t from "io-ts";
import { Boom } from "@hapi/boom";

export type ErrorBody = {};

const query = t.partial({
	field: t.string,
	value: t.unknown
});

type Query = t.TypeOf<typeof query>;

export const errorObject = t.type({
	status: t.string, // ex. "Not Found"
	statusCode: t.number, // ex. 404
	query, // ex. {field: "userId", value: ""}
	message: t.string // User does not exist
});

export type ErrorObject = t.TypeOf<typeof errorObject>;

class ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	protected constructor(
		private boom: Boom,
		private queryValue?: unknown,
		private queryField?: string
	) {}

	public toObject(): ErrorObject {
		return {
			status: this.boom.output.payload.error,
			statusCode: this.boom.output.payload.statusCode,
			query: {
				field: this.queryField,
				value: this.queryValue
			},
			message: this.boom.output.payload.message
		};
	}
}

export default ErrorBase;
