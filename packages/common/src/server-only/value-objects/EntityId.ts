import * as t from "io-ts";
import { Types } from "mongoose";

import {
	internalProjectEntityId,
	internalUserEntityId,
	InternalEntityId,
	internalHistoryEntityId,
	internalJobEntityId
} from "../codecs";

export type InternalJobEntityId = t.TypeOf<typeof internalJobEntityId>;

export type InternalHistoryEntityId = t.TypeOf<typeof internalHistoryEntityId>;

export type InternalProjectEntityId = t.TypeOf<typeof internalProjectEntityId>;

export type InternalUserEntityId = t.TypeOf<typeof internalUserEntityId>;

export function createEntityId<T extends InternalEntityId>(
	value: Types.ObjectId | string
): T {
	return ((typeof value === "string"
		? new Types.ObjectId(value)
		: value) as unknown) as T;
}
