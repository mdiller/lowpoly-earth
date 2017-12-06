const webpack = require("webpack");
const path = require("path");

var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(env) {
	var build_dir = env && env.build_dir ? env.build_dir : path.resolve(__dirname, "build");
	return {
		context: __dirname,
		entry: path.resolve(__dirname, "src"),
		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: /(node_modules)/,
					loader: "babel-loader"
				},
				{
					test: /\.json$/,
					loader: "json-loader"
				},
				{
					test: /\.dat$/,
					loader: "buffer-loader"
				},
				{
					test: /\.pg$/,
					loader: "raw-loader"
				}
			]
		},
		output: {
			filename: "bundle.js",
			path: build_dir
		},
		plugins: [
			new CopyWebpackPlugin([
				{ from: 'public' }
			])
		]
	};
};