import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";

type ParameterErrors = {
	errors: {
		key: string;
		actual: unknown;
		expected: unknown;
		message: unknown;
	}[];
};

export default class ErrorOnDispatchingDetection extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static ParameterError(
		queryValue: ParameterErrors,
		queryField?: string
	): ErrorOnDispatchingDetection {
		return new ErrorOnDispatchingDetection(
			Boom.badRequest("Invalid parameters"),
			queryValue,
			queryField
		);
	}
}
