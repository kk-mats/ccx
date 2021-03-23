import * as mongoose from "mongoose";

import { projectNameLimitation } from "../../all/constants/limitations/project";
import { userModelName, projectModelName } from "../constants/modelNames";

import * as History from "./HistoryModel";
import InternalProjectEntity from "../types/InternalProjectEntity";
import InternalProjectSource from "../types/InternalProjectSource";

type InternalProjectSourceForDB = Omit<InternalProjectSource, "gitURL"> & {
	gitURL?: string;
};

export type ProjectDocument = mongoose.Document &
	Omit<
		InternalProjectEntity,
		"internalProjectEntityId" | "histories" | "source"
	> & {
		histories: mongoose.Types.DocumentArray<History.HistoryDocument>;
		source: InternalProjectSourceForDB;
	};

const Schema = new mongoose.Schema({
	ownerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: userModelName,
		required: true
	},
	name: {
		type: String,
		required: true,
		...projectNameLimitation
	},
	source: {
		type: {
			gitURL: {
				type: String
			}
		},
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	lastUpdated: {
		type: Date,
		default: Date.now
	},
	histories: {
		type: [History.Schema],
		required: true
	}
});

Schema.index({ ownerId: 1, name: 1 }, { unique: true, background: true });

export const Model = mongoose.model<ProjectDocument>(projectModelName, Schema);

export default Model;
