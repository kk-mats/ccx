const path = require("path");

const tsconfig = path.resolve(__dirname, "tsconfig.json");

module.exports = {
	extends: [
		"airbnb-base",
		path.resolve(__dirname, "../", "../", ".eslintrc")
	],
	root: true,
	rules: {
		"import/extensions": [
			"error",
			"ignorePackages",
			{
			  "js": "never",
			  "ts": "never",
			}
		  ]
	},
	parserOptions: {
		project: tsconfig
	},
	settings: {
		"import/parsers": {
			"@typescript-eslint/parser": [".ts"]
		},
		"import/resolver": {
			typescript: {}
		}
	}
}