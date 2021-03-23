/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const ForkTsCheckerNotifierWebpackPlugin = require("fork-ts-checker-notifier-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const { ESBuildPlugin, ESBuildMinifyPlugin } = require('esbuild-loader');
const { TsconfigPathsPlugin } = require("tsconfig-paths-webpack-plugin");

const src = path.resolve(__dirname, "src");
const dist = path.resolve(__dirname, "..", "..", "dist", "client");
const tsconfigDev = path.resolve(__dirname, "tsconfig.dev.json");
const tsconfigProd = path.resolve(__dirname, "tsconfig.prod.json");

const monacoOptions = {
	languages: [
		"cpp",
		"csharp",
		"go",
		"java",
		"javascript",
		"kotlin",
		"objective-c",
		"perl",
		"php",
		"python",
		"ruby",
		"rust",
		"scala",
		"swift",
		"typescript",
	],
	features: ["bracketMatching", "find", "fontZoom", "wordHighlighter"],
};

const publicPath = process.env.URL_BASE;

const dev = {
	mode: "development",
	context: __dirname,
	entry: path.resolve(src, "index.tsx"),
	devtool: "inline-source-map",
	target: "web",
	watch: true,
	watchOptions: {
		ignored: /node_modules/,
	},
	module: {
		rules: [
			{
				test: /.css$/i,
				include: [/monaco-editor/],
				use: ["style-loader", "css-loader"],
			},
			{
				test: /.ttf$/,
				type: "asset/resource",
			},
			{
				test: /\.tsx?$/,
				loader: "esbuild-loader",
				options: {
					loader: "tsx",
					target: "es2015",
				},
			},
		],
	},
	optimization: {
		removeAvailableModules: false,
		removeEmptyChunks: false,
		splitChunks: false,
	},
	resolve: {
		plugins: [
			new TsconfigPathsPlugin({
				configFile: tsconfigDev,
				logLevel: "info",
			})
		],
		extensions: [".ts", ".tsx", ".js"]
	},
	output: {
		pathinfo: false,
		publicPath,
		filename: "bundle.js",
		path: dist,
	},
	cache: true,
	plugins: [
		new ESBuildPlugin(),
		new MonacoWebpackPlugin(monacoOptions),
		new webpack.EnvironmentPlugin(["URL_BASE"]),
		new HtmlWebpackPlugin({
			template: path.resolve(src, "index.html"),
			filename: path.resolve(dist, "index.html"),
		}),
	]
};

const prod = (useAnalyzer) => {
	const plugins = [
		new ESBuildPlugin(),
		new MonacoWebpackPlugin(monacoOptions),
		new webpack.EnvironmentPlugin(["URL_BASE"]),
		new HtmlWebpackPlugin({
			template: path.resolve(src, "index.html"),
			filename: path.resolve(dist, "index.html"),
		}),
	];

	if (useAnalyzer) {
		plugins.push(
			new ForkTsCheckerNotifierWebpackPlugin({
				title: "TypeScript",
				excludeWarnings: false,
			})
		);
		plugins.push(
			new BundleAnalyzerPlugin({
				analyzerHost: "0.0.0.0",
				analyzerPort: 8081,
			})
		);
	}

	return {
		mode: "production",
		context: __dirname,
		entry: path.resolve(src, "index.tsx"),
		target: "web",
		module: {
			rules: [
				{
					test: /.css$/,
					use: ["style-loader", "css-loader"],
				},
				{
					test: /.ttf$/,
					type: "asset/resource",
				},
				{
					test: /\.tsx?$/,
					loader: "esbuild-loader",
					options: {
						loader: "tsx",
						target: "es2015",
					},
				},
			],
		},
		resolve: {
			plugins: [
				new TsconfigPathsPlugin({
					configFile: tsconfigProd
				})
			],
			extensions: [".ts", ".tsx", ".js"]
		},
		output: {
			publicPath,
			filename: "bundle.js",
			path: dist,
		},
		optimization: {
			minimize: true,
			minimizer: [
				new ESBuildMinifyPlugin({
					target: "es2015"
				})
			],
		},
		plugins,
	};
};

module.exports = [
	{ name: "dev", ...dev },
	{ name: "build", ...prod(false) },
	{ name: "prod", ...prod(true) },
];
