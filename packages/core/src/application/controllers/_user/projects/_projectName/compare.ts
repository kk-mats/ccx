import express from "express";
import * as fs from "fs";
import * as path from "path";

import useAsync from "common/server-only/middlewares/useAsync";
import ProjectService from "domain/services/ProjectService";
import HistoryId from "common/all/types/HistoryId";
import DetectionResult from "common/all/types/DetectionResult";
import EDetectionResult, {
	convertE,
	MappingResult
} from "common/all/types/EDetectionResult";
import FileId from "common/all/types/FileId";
import ClonePairId from "common/all/types/ClonePairId";
import Fragment from "common/all/types/Fragment";
import ClonePair from "common/all/types/ClonePair";
import { Registry } from "types/registry";
import {
	createEntityId,
	InternalHistoryEntityId
} from "common/server-only/value-objects/EntityId";
import ProjectRepository from "infrastructure/repositories/ProjectRepository";

const router = express.Router({ mergeParams: true });

const cv = (f1: Fragment, f2: Fragment): boolean => {
	return (
		(Math.min(f1.end, f2.end) - Math.max(f1.begin, f2.begin) + 1) /
			(f2.end - f2.begin + 1) >
		0.6
	);
};

const cmatch = (cp1: ClonePair, cp2: ClonePair): boolean => {
	return cv(cp1.f1, cp2.f1) && cv(cp1.f2, cp2.f2);
};

const cfmatch = (cp1: ClonePair, cp2: ClonePair): boolean =>
	cmatch(cp1, cp2) && cmatch(cp2, cp1);

const map = (
	base: EDetectionResult,
	comparing: EDetectionResult
): MappingResult => {
	let fileCtr = 0;
	const allFiles: MappingResult["allFiles"] = {};
	const comparingToAllF: MappingResult["comparingToAllF"] = {};
	const baseToComparing: MappingResult["baseToComparing"] = {};
	const comparingToBase: MappingResult["comparingToBase"] = {};
	const allGrids: MappingResult["allGrids"] = {};

	Object.entries(base.files).forEach(([id, f]) => {
		allFiles[fileCtr] = { path: f, base: Number(id) as FileId };
		allGrids[fileCtr] = {};
		fileCtr += 1;
	});

	Object.entries(comparing.files).forEach(([id, f]) => {
		const file = Object.entries(allFiles).find(([, ff]) => ff.path === f);
		if (file) {
			comparingToAllF[Number(id)] = file[1].base;
			allFiles[Number(file[0])] = {
				...file[1],
				comparing: Number(id) as FileId
			};
		} else {
			allFiles[fileCtr] = { path: f, comparing: Number(id) as FileId };
			allGrids[fileCtr] = {};
			comparingToAllF[Number(id)] = fileCtr as FileId;
			fileCtr += 1;
		}
	});

	Object.entries(allFiles).forEach(([y, yf]) => {
		Object.entries(allFiles).forEach(([x, xf]) => {
			const xx = Number(x);
			const yy = Number(y);
			if (xx < yy) {
				let baseCP: ClonePairId[] = [];
				let comparingCP: ClonePairId[] = [];
				if (yf.base && xf.base) {
					const f1 = Math.min(yf.base, xf.base);
					const f2 = Math.max(yf.base, xf.base);
					baseCP = Object.entries(base.clonePairs)
						.filter(
							([, cp]) => cp.f1.file === f1 && cp.f2.file === f2
						)
						.map(([id]) => Number(id) as ClonePairId);
				}

				if (yf.comparing && xf.comparing) {
					const f1 = Math.min(yf.comparing, xf.comparing);
					const f2 = Math.max(yf.comparing, xf.comparing);
					comparingCP = Object.entries(comparing.clonePairs)
						.filter(
							([, cp]) => cp.f1.file === f1 && cp.f2.file === f2
						)
						.map(([id]) => Number(id) as ClonePairId);
				}

				if (baseCP.length > 0 || comparingCP.length > 0) {
					allGrids[yy][xx] = {
						base: baseCP,
						comparing: comparingCP
					};
				}
			}
		});
	});

	Object.values(allGrids).forEach((row) => {
		Object.values(row).forEach((grid) => {
			grid.base.forEach((bcp) => {
				grid.comparing.forEach((ccp) => {
					const bbcp = base.clonePairs[bcp];
					const cccp = comparing.clonePairs[ccp];
					if (cfmatch(bbcp, cccp)) {
						if (bcp in baseToComparing) {
							const v = baseToComparing[bcp];
							v.push(ccp);
							baseToComparing[bcp] = v;
						} else {
							baseToComparing[bcp] = [ccp];
						}

						if (ccp in comparingToBase) {
							const v = comparingToBase[ccp];
							v.push(bcp);
							comparingToBase[ccp] = v;
						} else {
							comparingToBase[ccp] = [bcp];
						}
					}
				});
			});
		});
	});

	return {
		base,
		comparing,
		comparingToAllF,
		baseToComparing,
		comparingToBase,
		allFiles,
		allGrids
	};
};

const defineRoute = (registry: Registry): express.Router => {
	// for checking directory path and revision
	router.get<
		{ userEntityId: string; projectName: string },
		MappingResult,
		unknown,
		{
			base?: string;
			comparing?: string;
		}
	>(
		"/",
		useAsync(async (req, res) => {
			const { userEntityId, projectName } = req.params;
			const { base, comparing } = req.query;
			if (typeof base !== "string" || typeof comparing !== "string") {
				res.sendStatus(403);
				return;
			}

			const [baseHistoryId, baseResultId] = base.split("-");
			const [comparingHistoryId, comparingResultId] = comparing.split(
				"-"
			);

			const project = await ProjectService.findProjectByName(
				createEntityId(userEntityId),
				projectName
			);

			const [baseR, comparingR] = (
				await Promise.all([
					ProjectRepository.readResult(
						project.ownerId,
						project.internalProjectEntityId,
						createEntityId(
							baseHistoryId
						) as InternalHistoryEntityId,
						baseResultId
					),
					ProjectRepository.readResult(
						project.ownerId,
						project.internalProjectEntityId,
						createEntityId(
							comparingHistoryId
						) as InternalHistoryEntityId,
						comparingResultId
					)
				])
			).map((r) => convertE(r));

			res.send(map(baseR, comparingR));
		})
	);
	return router;
};

export default defineRoute;
