import {
	userIdLimitation,
	passwordLimitation
} from "./constants/limitations/user";

export const tooShortUserIdErrorMessage = `User ID must be at least ${userIdLimitation.minlength} characters.`;
export const tooLongUserIdErrorMessage = `User ID must be ${userIdLimitation.maxlength} characters or less.`;
export const invalidUserIdErrorMessage = `User ID must begin or end with a alphanumeric character and can also include hyphens and underscores.`;
export const unavailableUserIdErrorMessage = `User ID is not available.`;

export const tooShortPasswordErrorMessage = `Password must be at least ${passwordLimitation.minlength} characters.`;
export const tooLongPasswordErrorMessage = `Password must be ${passwordLimitation.maxlength} characters or less.`;
export const invalidPasswordErrorMessage = `Password must include a number and a uppercase letter.`;

export const invalidGitURLErrorMessage = "Invalid Git URL.";
export const unsupportedGitProtocolErrorMessage = "Unsupported Git Protocol.";
