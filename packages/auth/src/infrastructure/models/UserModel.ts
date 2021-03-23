import * as mongoose from "mongoose";

import UserLimitations from "common/all/constants/limitations/user";
import { userModelName } from "common/server-only/constants/modelNames";

export type DocumentType = mongoose.Document & {
	userId: string;
	password: string;
};

const Schema = new mongoose.Schema({
	userId: {
		type: String,

		unique: true,
		required: true,
		...UserLimitations.userIdLimitation
	},
	password: {
		type: String,
		required: true,
		...UserLimitations.passwordLimitation
	}
});

export const Model = mongoose.model<DocumentType>(userModelName, Schema);

export default Model;
