const path = require("path");

const tsconfig = path.resolve(__dirname, "tsconfig.json")

module.exports = {
	extends: [
		"airbnb",
		"airbnb/hooks",
		"prettier/react",
		"plugin:jsx-a11y/recommended",
		"plugin:react/recommended",
		path.resolve(__dirname, "../", "../", ".eslintrc")
	],
	root: true,
	rules: {
		"react/jsx-filename-extension": [1, { "extensions": [".tsx"] }],
		"react/jsx-props-no-spreading": "off",
		"react/prop-types": "off",
		"react/require-default-props": "off",
		"react/display-name": "off"
	},
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		project: tsconfig
	},
	globals: {
		document: true,
		window: true,
		AbortController: true,
		FileReader: true,
		Response: true
	},
	settings: {
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"]
		},
		"import/resolver": {
			typescript: {}
		}
	}
}