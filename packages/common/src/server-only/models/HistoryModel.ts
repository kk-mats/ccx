import * as mongoose from "mongoose";

import InternalHistoryEntity from "../types/InternalHistoryEntity";

export type HistoryDocument = mongoose.Types.Subdocument &
	Omit<InternalHistoryEntity, "internalHistoryEntityId" | "dispatched"> & {
		dispatched?: InternalHistoryEntity["dispatched"];
	};

export const PluginSchema = new mongoose.Schema({
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
	}
});

export const DetectionTargetSchema = new mongoose.Schema(
	{
		directory: {
			type: String,
			required: true
		},
		revision: {
			type: String,
			required: true
		}
	},
	{ _id: false }
);

export const Schema = new mongoose.Schema({
	dispatched: {
		type: Date,
		required: true,
		default: Date.now
	},
	started: {
		type: Date
	},
	finished: {
		type: Date
	},
	request: {
		plugin: {
			type: PluginSchema,
			required: true
		},
		targets: {
			type: [DetectionTargetSchema],
			required: true
		},
		args: {
			detectorVersion: {
				type: String,
				required: true
			},
			parameters: {
				type: Object,
				required: true
			}
		}
	},
	status: {
		type: String,
		validate: /[Succeeded|Failed|Pending|Running]/,
		default: "Pending"
	},
	summaries: {
		type: [
			{
				id: {
					type: Number,
					require: true
				},
				numberOfClonePairs: {
					type: Number,
					require: true
				}
			}
		]
	}
});

export default Schema;
