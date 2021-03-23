module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2020,
		project: "tsconfig.json",
		sourceType: "module"
	},
	plugins: ["prettier", "@typescript-eslint"],
	extends: [
		"airbnb-base",
		"eslint:recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
		"plugin:@typescript-eslint/recommended",
		"prettier",
		"prettier/@typescript-eslint"
	],
	rules: {
		"prettier/prettier": [
			"error",
			{
				tabWidth: 4,
				useTabs: true,
				trailingComma: "none",
				endOfLine: "lf"
			}
		],
		"import/prefer-default-export": "off"
	},
	settings: {
		"import/parsers": {
			"@typescript-eslint/parser": [".js", ".ts"]
		},
		"import/resolver": {
			node: {
				extensions: [".js", ".ts"]
			},
			typescript: {}
		}
	}
};