const webpack = require("webpack");
const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
	mode: "development",
	devtool: "hidden-source-map",

	entry: {
		app: "./src/index.tsx",
		vendor: ["react", "react-dom", "styled-components"],
	},

	resolve: {
		extensions: [".ts", ".tsx", ".js"],
		plugins: [new TsconfigPathsPlugin()],
	},

	output: {
		path: path.join(__dirname, "dist"),
		filename: "static/js/[name].[fullhash].js",
		chunkFilename: "static/js/[name].[chunkhash].chunk.js",
		publicPath: "/",
	},

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/i,
					chunks: "all",
				},
			},
		},

		runtimeChunk: { name: "runtime" },
	},

	module: {
		rules: [
			{
				test: /\.(ts|tsx|js)$/,
				exclude: /node_modules/,
				use: ["babel-loader", "ts-loader"],
			},
			{
				test: /\.(png|jpg|jpeg)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "url-loader",
						options: {
							limit: 8000,
							name: "static/images/[name].[ext]",
						},
					},
				],
			},
			{
				test: /\.svg$/,
				use: ["file-loader"],
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},

	devServer: {
		historyApiFallback: true,
		inline: true,
		port: 3000,
		hot: true,
		publicPath: "/",
		host: "0.0.0.0",
	},

	plugins: [new CleanWebpackPlugin(), new HtmlWebpackPlugin({ template: "./public/index.html" }), new webpack.ProvidePlugin({ React: "react" }), new webpack.HotModuleReplacementPlugin(), new webpack.optimize.SplitChunksPlugin({ name: "vendor" })],
};
