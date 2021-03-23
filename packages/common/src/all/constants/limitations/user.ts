export const userIdLimitation = {
	minlength: 3,
	maxlength: 16,
	validator: /^[a-zA-Z\d](([a-zA-Z\d-_]){0,14}[a-zA-Z\d])?$/
};

export const passwordLimitation = {
	minlength: 8,
	maxlength: 128,
	validator: /^.*(([A-Z].*[0-9])|([0-9].*[A-Z])).*$/
};

export default {
	userIdLimitation,
	passwordLimitation
};
