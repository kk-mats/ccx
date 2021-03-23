import * as t from "io-ts";

import ErrorBase, { errorObject } from "./ErrorBase";

type V = {
	error?: undefined;
	[K: string]: unknown;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const succeedResult = <T extends t.Mixed>(valueType: T) =>
	t.intersection([
		valueType,
		t.partial({
			error: t.undefined
		})
	]);

type SucceededResult<T> = T & {
	error?: undefined;
};

const failedResult = t.type({
	error: errorObject
});

export type FailedResult = t.TypeOf<typeof failedResult>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const result = <T extends t.Mixed>(valueType: T) =>
	t.union([succeedResult(valueType), failedResult]);

type Result<T> = SucceededResult<T> | FailedResult;

export const fromError = <E extends ErrorBase>(error: E): FailedResult => {
	return {
		error: error.toObject()
	};
};

export const fromValue = <T extends V>(value: T): SucceededResult<T> => {
	return value;
};

// eslint-disable-next-line no-undef
export default Result;
