import * as mongoose from "mongoose";

import {
	userModelName,
	jobModelName,
	projectModelName
} from "../constants/modelNames";
import { DetectionTargetSchema } from "./HistoryModel";
import InternalJobEntity from "../types/InternalJobEntity";

export type JobDocument = mongoose.Document &
	Omit<InternalJobEntity, "internalJobEntityId">;

const Schema = new mongoose.Schema<JobDocument>({
	internalUserEntityId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: userModelName,
		required: true
	},
	internalProjectEntityId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: projectModelName,
		required: true
	},
	internalHistoryEntityId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: `${projectModelName}.histories`,
		required: true
	},
	targets: {
		type: [DetectionTargetSchema],
		required: true
	},
	plugin: {
		type: {
			id: {
				type: String,
				required: true
			},
			name: {
				type: String,
				required: true
			},
			owner: {
				type: String,
				required: true
			},
			environment: {
				type: {
					linux: {
						command: String,
						dockerfile: String
					},
					windows: {
						command: String,
						dockerfile: String
					}
				},
				required: true
			}
		},
		required: true
	},
	args: {
		type: {
			detectorVersion: {
				type: String,
				required: true
			},
			parameters: {
				type: Object,
				required: true
			}
		},
		required: true
	},
	workerBaseUrl: {
		type: String,
		required: false
	}
});

export const Model = mongoose.model<JobDocument>(jobModelName, Schema);

export default Model;
