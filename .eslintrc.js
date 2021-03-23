const path = require("path");

const tsconfig = path.resolve(__dirname, "tsconfig.json");

module.exports = {
	extends: [
		"airbnb-base",
		"prettier",
		"prettier/@typescript-eslint",
		"plugin:prettier/recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:import/warnings",
		"plugin:import/errors",
		"plugin:import/typescript"
	],
	ignorePatterns: ["**/node_modules/**", "**/dist/**"],
	rules:{
		"prettier/prettier": [
			"error",
			{
				tabWidth: 4,
				useTabs: true,
				trailingComma: "none",
				endOfLine: "lf"
			}
		],
		"no-underscore-dangle": ["error", { "allow": ["_id"] }],
		"import/no-unresolved": "off",
		"no-useless-constructor": "off",
		"import/prefer-default-export": "off",
		"default-case": "off"
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: tsconfig
	},
	settings: {
		"import/parsers": {
			"@typescript-eslint/parser": [".ts"]
		},
		"import/resolver": {
			typescript: {
				project: tsconfig
			}
		}
	}
}