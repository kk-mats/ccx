/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
	Breadcrumbs,
	Link,
	LinkProps,
	Typography,
	Box
} from "@material-ui/core";
import { ChevronRight } from "mdi-material-ui";

type LinkRouterProps = LinkProps & {
	to: string;
	replace?: boolean;
};

const LinkRouter: React.FunctionComponent<LinkRouterProps> = (
	props: LinkRouterProps
) => (
	<Typography variant="h4">
		<Link {...props} component={RouterLink as any} />
	</Typography>
);

const slugToWords = (slug: string): string => {
	const [head, ...tail] = slug.split("-");
	const str = [head[0].toUpperCase() + head.slice(1), ...tail].join(" ");
	return str;
};

const sx = { mb: 4 };

const RouterBreadcrumbs: React.FunctionComponent = () => {
	const [home, project, ...tail] = useLocation()
		.pathname.split("/")
		.filter((p) => p);

	const pathnames = tail.map((path) => slugToWords(path));

	return (
		<Box mb={4}>
			<Breadcrumbs
				maxItems={4}
				separator={<ChevronRight fontSize="small" />}
			>
				<LinkRouter to="/home" color="textSecondary">
					Home
				</LinkRouter>
				<LinkRouter to={`/home/${project}`} color="textSecondary">
					{project}
				</LinkRouter>
				{pathnames.map((value, index) => {
					const last = index === pathnames.length - 1;
					const to = `/${home}/${project}/${pathnames
						.slice(0, index + 1)
						.join("/")}`;

					return last ? (
						<Typography key={to} color="secondary" variant="h4">
							{value}
						</Typography>
					) : (
						<LinkRouter
							key={value}
							to={to}
							color="textSecondary"
							variant="h4"
						>
							{value}
						</LinkRouter>
					);
				})}
			</Breadcrumbs>
		</Box>
	);
};

export default RouterBreadcrumbs;
