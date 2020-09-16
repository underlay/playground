const path = require("path")

module.exports = {
	devtool: "source-map",

	entry: {
		index: __dirname + "/index.tsx",
	},

	output: {
		filename: "[name].min.js",
		path: path.resolve(__dirname, "lib"),
	},

	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
		alias: { stream: "readable-stream", path: "path-browserify" },
	},

	node: {
		fs: "empty",
		stream: "empty",
	},

	module: {
		rules: [
			{
				test: /\.(jsonld)$/,
				exclude: /shex\.js/,
				options: { publicPath: "lib", name: "[name].[ext]" },
				loader: "file-loader",
			},
			{
				enforce: "pre",
				test: /\.js$/,
				loader: "source-map-loader",
			},
			{
				test: /\.tsx?$/,
				exclude: /node_modules\//,
				loader: "ts-loader",
			},
		],
	},
}
