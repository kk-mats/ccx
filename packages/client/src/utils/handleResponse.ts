export type ResponseHandlers = {
	[P: number]: (res: Response) => void;
};

const handleResponse = (res: Response, handlers: ResponseHandlers): void => {
	if (res.status in handlers) {
		handlers[res.status](res);
	}
};

export default handleResponse;
