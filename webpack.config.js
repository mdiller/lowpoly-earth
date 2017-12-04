const webpack = require("webpack");
const path = require("path");

var CopyWebpackPlugin = require('copy-webpack-plugin');

config = {
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
			}
		]
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "build"),
		publicPath: "build/"
	},
	devServer: {
		outputPath: path.join(__dirname, "build")
	},
	plugins: [
		new CopyWebpackPlugin([
			{ from: 'public' }
		])
	]
};

module.exports = config;