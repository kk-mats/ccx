import {
	GetResponse,
	route
} from "common/auth-client/api/v1/projects/_projectName/check";
import api from "utils/api";

export type ValidateRepositoryPath = (
	project: string,
	directory: unknown,
	revision: unknown,
	setTimer: React.Dispatch<React.SetStateAction<number | undefined>>,
	onFinish: (res: { directory?: string; revision?: string }) => void
) => void;

export const validateRepositoryPath: ValidateRepositoryPath = (
	project,
	directory,
	revision,
	setTimer,
	onFinish
) => {
	setTimer(
		window.setTimeout(() => {
			api.post(route(project), {
				json: {
					directory,
					revision
				},
				throwHttpErrors: undefined
			})
				.json<GetResponse>()
				.then(onFinish);
		}, 500)
	);
};

export const validateRepositoryPathMock: ValidateRepositoryPath = (
	project,
	directory,
	revision,
	setTimer,
	onFinish
) => {};
