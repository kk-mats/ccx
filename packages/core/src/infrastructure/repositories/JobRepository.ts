import got from "got";

import JobModel from "common/server-only/models/JobModel";
import InternalJobEntity from "common/server-only/types/InternalJobEntity";
import createInternalJobEntity from "domain/factories/createInternalJobEntity";
import {
	InternalHistoryEntityId,
	InternalJobEntityId,
	InternalProjectEntityId,
	InternalUserEntityId
} from "common/server-only/value-objects/EntityId";
import { Plugin } from "common/all/types/plugin";
import DetectionTarget from "common/all/types/DetectionTarget";
import DetectorVersion from "common/all/types/DetectorVersion";
import { DetectionParameters } from "common/all/types/parameters";

export default class JobRepository {
	public static async all(): Promise<InternalJobEntity[]> {
		return (await JobModel.find({}).exec()).map((d) =>
			createInternalJobEntity(d)
		);
	}

	public static async dispatch(
		internalUserEntityId: InternalUserEntityId,
		internalProjectEntityId: InternalProjectEntityId,
		internalHistoryEntityId: InternalHistoryEntityId,
		plugin: Plugin,
		targets: DetectionTarget[],
		args: {
			detectorVersion: DetectorVersion;
			parameters: DetectionParameters;
		}
	): Promise<InternalJobEntity> {
		return createInternalJobEntity(
			await JobModel.create({
				internalUserEntityId,
				internalProjectEntityId,
				internalHistoryEntityId,
				plugin,
				targets,
				args
			})
		);
	}

	public static async abort(
		internalHistoryEntityId: InternalHistoryEntityId
	): Promise<boolean> {
		const job = await JobModel.findOne({ internalHistoryEntityId }).exec();
		if (job && job.workerBaseUrl !== undefined) {
			const [res] = await Promise.all([
				got.delete(`http://${job.workerBaseUrl}/jobs/${job._id}`, {
					throwHttpErrors: false
				}),
				JobModel.findByIdAndDelete(job._id).exec()
			]);

			switch (res.statusCode) {
				case 200:
					return true;
				case 404:
					return false;
				default:
					return false;
			}
		}
		return false;
	}

	public static async setRunning(
		internalJobEntityId: InternalJobEntityId
	): Promise<InternalJobEntity | null> {
		const job = await JobModel.findByIdAndUpdate(internalJobEntityId, {
			$set: {
				isRunning: true
			}
		});
		if (!job) {
			return null;
		}

		return createInternalJobEntity(job);
	}

	public static async delete(
		internalJobEntityId: string | InternalJobEntityId
	): Promise<InternalJobEntity | null> {
		const job = await JobModel.findByIdAndDelete(
			internalJobEntityId
		).exec();
		if (!job) {
			return null;
		}
		return createInternalJobEntity(job);
	}
}
