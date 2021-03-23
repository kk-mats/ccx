import React from "react";
import { Link } from "react-router-dom";
import { ListItem, ListItemProps } from "@material-ui/core";

let hashFragment = "";
let observer: MutationObserver | null = null;
let asyncTimerId: number | null = null;
let scrollFunction: ((el: HTMLElement) => void) | null = null;

function reset() {
	hashFragment = "";
	if (observer !== null) observer.disconnect();
	if (asyncTimerId !== null) {
		window.clearTimeout(asyncTimerId);
		asyncTimerId = null;
	}
}

function getElAndScroll() {
	const element = document.getElementById(hashFragment);
	if (element !== null && scrollFunction !== null) {
		scrollFunction(element);
		reset();
		return true;
	}
	return false;
}

function hashLinkScroll(timeout?: number) {
	// Push onto callback queue so it runs after the DOM is updated
	window.setTimeout(() => {
		if (getElAndScroll() === false) {
			if (observer === null) {
				observer = new MutationObserver(getElAndScroll);
			}
			observer.observe(document, {
				attributes: true,
				childList: true,
				subtree: true
			});
			// if the element doesn't show up in specified timeout or 10 seconds, stop checking
			asyncTimerId = window.setTimeout(() => {
				reset();
			}, timeout || 10000);
		}
	}, 0);
}

type HashLinkProps = {
	children?: React.ReactNode;
	timeout?: number;
	to: string;
	nodeId?: string;
};

// eslint-disable-next-line react/display-name
const HashLink = React.forwardRef<any, HashLinkProps>(
	({ nodeId, timeout, children, ...rest }, ref) => {
		const handleClick: React.MouseEventHandler<HTMLAnchorElement> = React.useCallback(() => {
			reset();
			hashFragment = nodeId ?? rest.to.split("#").slice(1).join("#");
			if (hashFragment !== "") {
				scrollFunction = (el) => {
					el.scrollIntoView({ behavior: "smooth" });
				};
				hashLinkScroll(timeout);
			}
		}, [nodeId, rest.to, timeout]);

		return (
			<Link {...rest} onClick={handleClick} ref={ref}>
				{children}
			</Link>
		);
	}
);

type Props = ListItemProps & {
	to: string;
	nodeId?: string;
};

const ListItemHashLink: React.FunctionComponent<Props> = ({
	to,
	children,
	...rest
}) => {
	return (
		<ListItem
			button={true as any}
			component={HashLink as any}
			to={to}
			{...rest}
		>
			{children}
		</ListItem>
	);
};

export default ListItemHashLink;
