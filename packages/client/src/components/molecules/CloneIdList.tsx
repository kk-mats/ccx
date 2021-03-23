import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { List, ListItemText } from "@material-ui/core";

import compareFragment from "common/all/utils/compareFragment";

import useSingleResult from "hooks/useSingleResult";

import ListItemHashLink from "components/atoms/ListItemHashLink";

type Props = {
	className?: string;
};

const CloneIdList: React.FunctionComponent<Props> = ({ className }) => {
	const { pathname, hash } = useLocation();
	const { project, historyId, resultId } = useParams<
		Record<"project" | "historyId" | "resultId", string>
	>();
	const [result] = useSingleResult();

	const clones = React.useMemo(
		() =>
			Object.values(result.biased)
				.flatMap((p) => {
					if (p.paired.file === result.base.id) {
						return [
							p,
							{
								id: p.id,
								f: p.paired,
								biased: p.f
							}
						];
					}
					return [p];
				})
				.sort((p1, p2) => compareFragment(p1.f, p2.f)),
		[pathname, result.base.id]
	);

	return (
		<List dense className={className}>
			{clones.map(({ id, f }) => {
				const intId = id.toFixed();
				const idHash = `#${intId}`;

				return (
					<ListItemHashLink
						key={`${idHash}-${f.begin}`}
						selected={hash === idHash}
						to={`/home/${project}/history/${historyId}/result/${resultId}/${result.base.path}${idHash}`}
						nodeId={f.begin.toFixed()}
					>
						<ListItemText
							primary={`Ln ${f.begin}-${f.end - 1} #${intId}`}
						/>
					</ListItemHashLink>
				);
			})}
		</List>
	);
};

export default CloneIdList;
