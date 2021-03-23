import { Options } from "ky";

type FetchOptions = Omit<Options, "method">;

// eslint-disable-next-line no-undef
export default FetchOptions;
