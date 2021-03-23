import * as Boom from "@hapi/boom";

import ErrorBase from "common/all/types/ErrorBase";

export default class HistoryError extends ErrorBase {
	// eslint-disable-next-line no-useless-constructor
	private constructor(
		boom: Boom.Boom,
		queryValue?: unknown,
		queryField?: string
	) {
		super(boom, queryValue, queryField);
	}

	public static historyNotFound(
		queryValue: string,
		queryField?: string
	): HistoryError {
		return new HistoryError(
			Boom.internal("History not found"),
			queryValue,
			queryField
		);
	}
}
