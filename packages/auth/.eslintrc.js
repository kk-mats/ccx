const path = require("path");

const tsconfig = path.resolve(__dirname, "tsconfig.json");

module.exports = {
	extends: [
		"airbnb-base",
		path.resolve(__dirname, "../", "../", ".eslintrc")
	],
	root: true,
	parserOptions: {
		project: tsconfig
	},
	settings: {
		"import/resolver": {
			typescript: {}
		}
	}
}