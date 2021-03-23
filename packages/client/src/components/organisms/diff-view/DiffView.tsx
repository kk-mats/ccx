import React from "react";
import { Redirect, useLocation } from "react-router-dom";
import { CircularProgress, makeStyles } from "@material-ui/core";

import { MappingResult } from "common/all/types/EDetectionResult";
import ClonePair from "common/all/types/ClonePair";
import Fragment from "common/all/types/Fragment";
import Position from "common/all/types/Position";
import ClonePairId from "common/all/types/ClonePairId";
import Similarity from "common/all/types/Similarity";

import SplitPane from "components/atoms/SplitPane";
import Explorer from "components/organisms/diff-view/Explorer";

import useMappingResult from "hooks/useMappingResult";
import useQueryParam from "hooks/useQueryParam";
import compareFragment from "common/all/utils/compareFragment";

const DiffClonePairView = React.lazy(
	() => import("components/organisms/diff-view/DiffClonePairView")
);

type Props = {
	project: string;
};

const useStyles = makeStyles({
	root: {
		"& > *": {
			height: "100%"
		}
	}
});

const useCellCoordinate = (result: MappingResult) => {
	const params = useQueryParam();
	return React.useMemo(() => {
		const [xx, yy] = [params.get("x"), params.get("y")];
		if (
			xx !== null &&
			yy !== null &&
			xx in result.allFiles &&
			yy in result.allFiles
		) {
			const [x, y] = [Number(xx), Number(yy)];
			return x < y ? { x, y } : { y, x };
		}
		return null;
	}, [params, result]);
};

const mergeFragments = (f1: Fragment, f2: Fragment): Fragment => ({
	file: f1.file,
	begin: (Math.min(f1.begin, f2.begin) as unknown) as Position,
	end: (Math.max(f1.end, f2.end) as unknown) as Position
});

const mergeClonePairs = (p1: ClonePair, p2: ClonePair): ClonePair => {
	return {
		id: 0 as ClonePairId,
		similarity: -1 as Similarity,
		f1: mergeFragments(p1.f1, p2.f1),
		f2: mergeFragments(p1.f2, p2.f2)
	};
};

const useUnifiedClonePairs = () => {
	const { result } = useMappingResult();
	const c = useCellCoordinate(result);
	return React.useMemo(() => {
		if (!c) {
			return null;
		}
		const { x, y } = c;
		const { base, comparing } = result.allGrids[y][x];
		const { baseToComparing, comparingToBase } = result;
		const baseUnmapped: ClonePairId[] = [];
		const comparingUnmapped: ClonePairId[] = [];
		const unifiedClonePairs: {
			base: ClonePairId;
			comparing: ClonePairId[];
			p: ClonePair;
		}[] = [];

		base.forEach((id) => {
			if (id in baseToComparing) {
				const comparingIds = baseToComparing[id];
				const merged = result.base.clonePairs[id];
				const comparingMerged = comparingIds
					.map((i) => result.comparing.clonePairs[i])
					.reduce((p1, p2) => mergeClonePairs(p1, p2));

				unifiedClonePairs.push({
					base: id,
					comparing: comparingIds,
					p: mergeClonePairs(merged, comparingMerged)
				});
			} else {
				baseUnmapped.push(id);
			}
		});

		comparing.forEach((id) => {
			if (id in comparingToBase) {
			} else {
				comparingUnmapped.push(id);
			}
		});

		return {
			x,
			y,
			xPath: result.allFiles[x],
			yPath: result.allFiles[y],
			baseUnmapped,
			comparingUnmapped,
			unifiedClonePairs: unifiedClonePairs
				.sort((p1, p2) => compareFragment(p1.p.f1, p2.p.f1))
				.map((p, index) => ({
					...p,
					p: {
						...p.p,
						id: index as ClonePairId
					}
				}))
		};
	}, [c, result]);
};

const useSelected = () => {
	const { hash } = useLocation();
	return React.useMemo(() => {
		if (hash.startsWith("#")) {
			return hash.split("#")[1];
		}

		return null;
	}, [hash]);
};

const DiffView: React.FunctionComponent<Props> = ({ project }) => {
	const { root } = useStyles();
	const selected = useSelected();
	const c = useUnifiedClonePairs();

	if (c === null) {
		return <Redirect to={`/home/${project}/diff`} />;
	}

	return (
		<SplitPane className={root} allowResize split="vertical" minSize={250}>
			<Explorer
				selected={selected}
				baseUnmapped={c.baseUnmapped}
				comparingUnmapped={c.comparingUnmapped}
				unifiedClonePairs={c.unifiedClonePairs}
			/>
			<React.Suspense fallback={<CircularProgress />}>
				<DiffClonePairView
					project={project}
					x={c.x}
					y={c.y}
					selected={selected}
					baseUnmapped={c.baseUnmapped}
					comparingUnmapped={c.comparingUnmapped}
					unifiedClonePairs={c.unifiedClonePairs}
				/>
			</React.Suspense>
		</SplitPane>
	);
};

export default DiffView;
