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
		extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
		alias: {
			stream: "readable-stream",
			path: "path-browserify",
		},
	},

	node: {
		fs: "empty",
		stream: "empty",
	},

	module: {
		rules: [
			{
				enforce: "pre",
				test: /\.(jsonld|json)$/,
				exclude: /shex\.js/,
				type: "javascript/auto",
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
				exclude: /\/node_modules\//,
				loader: "ts-loader",
			},
			{
				test: /\.js$/,
				include: /\/node_modules\/apg\/lib\//,
				rules: [
					{
						resolve: {
							alias: {
								"io-ts": path.resolve(__dirname, "io-ts.js"),
							},
						},
					},
				],
			},
		],
	},
}
