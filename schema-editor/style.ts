import cytoscape from "cytoscape"
import dagre from "cytoscape-dagre"

cytoscape.use(dagre)

export const DagreLayout = ({
	name: "dagre",
	spacingFactor: 1.5,
	fit: true,
	padding: 20,
	minLen: (edge: cytoscape.EdgeSingular) => {
		if (edge.hasClass("component") || edge.hasClass("option")) {
			const key = edge.data("key") || ""
			return Math.ceil((key.length + 4) / 14)
		}
		return 1
	},
	edgeWeight: (edge: cytoscape.EdgeSingular) => {
		if (edge.hasClass("reference")) {
			return 1
		} else if (edge.hasClass("type")) {
			return 3
		} else {
			return 2
		}
	},
} as unknown) as cytoscape.LayoutOptions

export const Style: cytoscape.Stylesheet[] = [
	{
		selector: "node",
		style: { "border-width": 1, "border-style": "solid" },
	},
	{
		selector: "node.label, node.literal, edge.component, edge.option",
		style: {
			color: "#111111",
			"font-family": '"Fira Code", monospace',
		},
	},
	{
		selector: "node.label, node.literal",
		style: {
			"text-halign": "center",
			"text-valign": "center",
			width: "data(width)",
			height: "data(height)",
		},
	},
	// {
	// 	selector: "node:selected",
	// 	style: { "border-width": 3 },
	// },
	{
		selector: "node.label",
		style: {
			label: "data(key)",
			shape: "round-rectangle",
			"background-color": "seashell",
			"border-color": "dimgrey",
			"font-size": 18,
			"text-margin-y": 2,
		},
	},
	{
		selector: "node.reference",
		style: {
			width: 20,
			height: 20,
			shape: "ellipse",
			"background-color": "mistyrose",
			"border-color": "grey",
		},
	},
	{
		selector: "node.reference.error",
		style: {
			"background-color": "red",
			"border-color": "grey",
		},
	},
	{
		selector: "node.unit",
		style: {
			width: 20,
			height: 20,
			shape: "ellipse",
			"background-color": "#ccc",
			"border-color": "grey",
		},
	},
	{
		selector: "node.unit.error",
		style: {
			"background-color": "red",
		},
	},
	{
		selector: "node.uri",
		style: {
			shape: "diamond",
			"background-color": "darkseagreen",
			"border-color": "#5e735e",
		},
	},
	{
		selector: "node.literal",
		style: {
			label: "data(datatype)",
			shape: "cut-rectangle",
			"background-color": "lightyellow",
			"border-color": "#555",
			"font-size": 12,
			"text-margin-y": 1,
		},
	},
	{
		selector: "node.product",
		style: {
			shape: "hexagon",
			width: 36,
			height: 30,
			"background-color": "aliceblue",
			"border-color": "lightslategrey",
		},
	},
	{
		selector: "node.coproduct",
		style: {
			shape: "round-hexagon",
			width: 36,
			height: 30,
			"background-color": "lavender",
			"border-color": "#9696ae",
		},
	},

	{
		selector: "edge.type",
		style: {
			width: 3,
			"curve-style": "bezier",
			"line-style": "solid",
			"line-color": "#aaa",
			"z-index": 2,
		},
	},
	// {
	// 	selector: "edge.type:selected",
	// 	style: {
	// 		width: 5,
	// 		"line-color": "dimgrey",
	// 	},
	// },
	{
		selector: "edge.component, edge.option",
		style: {
			width: 4,
			label: "data(key)",
			"font-size": 12,
			"text-background-color": "whitesmoke",
			"text-background-padding": "4",
			"text-background-opacity": 1,
			"text-rotation": ("autorotate" as unknown) as undefined,
			"curve-style": "bezier",
			"line-style": "dashed",
		},
	},
	{
		selector: "edge.component",
		style: {
			"line-dash-pattern": [9, 3],
			"line-color": "lightslategray",
			"target-arrow-color": "lightslategray",
			"source-arrow-color": "lightslategray",
			"source-arrow-shape": "tee",
			"target-arrow-shape": "triangle",
			"z-index": 2,
		},
	},
	// {
	// 	selector: "edge.component:selected",
	// 	style: {
	// 		width: 6,
	// 		"line-color": "darkslategray",
	// 		"target-arrow-color": "darkslategray",
	// 		"source-arrow-color": "darkslategray",
	// 	},
	// },
	{
		selector: "edge.option",
		style: {
			"line-dash-pattern": [4, 4],
			"line-color": "#9696ae",
			"target-arrow-color": "#9696ae",
			"source-arrow-color": "#9696ae",
			"source-arrow-shape": "triangle-tee",
			"z-index": 2,
		},
	},
	// {
	// 	selector: "edge.option:selected",
	// 	style: {
	// 		width: 6,
	// 		"line-color": "#52526f",
	// 		"target-arrow-color": "#52526f",
	// 		"source-arrow-color": "#52526f",
	// 	},
	// },
	{
		selector: "edge.reference",
		style: {
			width: 3,
			"curve-style": "unbundled-bezier",
			"control-point-distances": "-40",
			"control-point-weights": "0.33",
			"line-style": "solid",
			"line-color": "#ddd",
			"z-index": 1,
		},
	},
	// {
	// 	selector: "edge.reference:selected",
	// 	style: {
	// 		width: 5,
	// 		"line-color": "dimgrey",
	// 	},
	// },
]
