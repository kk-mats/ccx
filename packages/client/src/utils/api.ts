import ky from "ky";

const api = ky.create({
	prefixUrl: `${process.env.URL_BASE}api/v1`
});

export default api;
