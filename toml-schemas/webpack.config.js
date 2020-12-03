const path = require("path")

module.exports = {
	target: "web",
	devtool: "source-map",

	entry: {
		index: path.resolve(__dirname, "index.tsx"),
	},

	output: {
		filename: "[name].min.js",
		path: path.resolve(__dirname, "lib"),
	},

	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx"],
	},

	module: {
		rules: [
			{
				enforce: "pre",
				test: /\.js$/,
				loader: "source-map-loader",
			},
			{
				test: /\.tsx?$/,
				exclude: /\/node_modules\//,
				loader: "ts-loader",
			},
		],
	},
}
