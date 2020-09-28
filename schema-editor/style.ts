import cytoscape from "cytoscape"

export type LayoutOptions = {
	circle: boolean
	directed: boolean
	inverted: boolean
}

export const TreeLayout = {
	name: "breadthfirst",
	padding: 12,
	animate: true,
	spacingFactor: 1.2,
	fit: false,
	maximal: false,
	circle: false,
	directed: false,
} as cytoscape.LayoutOptions

export const CircleLayout = {
	name: "breadthfirst",
	padding: 12,
	animate: true,
	spacingFactor: 1.2,
	fit: false,
	maximal: false,
	circle: true,
	directed: false,
	roots: "node.label",
} as cytoscape.LayoutOptions

export const Style: cytoscape.Stylesheet[] = [
	{
		selector: "node",
		style: { "border-width": 1, "border-style": "solid" },
	},
	{
		selector: "node:selected",
		style: { "border-width": 3 },
	},
	{
		selector: "node.label",
		style: {
			width: "data(width)",
			height: "data(height)",
			"background-image": "data(svg)",
			shape: "round-rectangle",
			"background-color": "seashell",
			"border-color": "dimgrey",
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
		selector: "node.iri",
		style: {
			shape: "diamond",
			"background-color": "darkseagreen",
			"border-color": "#5e735e",
		},
	},
	{
		selector: "node.literal",
		style: {
			width: "data(width)",
			height: "data(height)",
			"background-image": "data(svg)",
			shape: "rectangle",
			"background-color": "lightyellow",
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
		selector: "edge.value",
		style: {
			width: 3,
			"curve-style": "bezier",
			"line-style": "solid",
			"line-color": "#aaa",
			"z-index": 2,
		},
	},
	{
		selector: "edge.value:selected",
		style: {
			width: 5,
			"line-color": "dimgrey",
		},
	},
	{
		selector: "edge.component",
		style: {
			width: 4,
			label: "data(key)",
			"curve-style": "bezier",
			"font-size": 10,
			"text-background-color": "whitesmoke",
			"text-background-padding": "4",
			"text-background-opacity": 1,
			"font-family": "monospace",
			"text-rotation": ("autorotate" as unknown) as undefined,
			"line-style": "dashed",
			"line-dash-pattern": [9, 3],
			"line-color": "lightslategray",
			"target-arrow-color": "lightslategray",
			"source-arrow-color": "lightslategray",
			"source-arrow-shape": "tee",
			"target-arrow-shape": "triangle",
			"z-index": 2,
		},
	},
	{
		selector: "edge.component:selected",
		style: {
			width: 6,
			"line-color": "darkslategray",
			"target-arrow-color": "darkslategray",
			"source-arrow-color": "darkslategray",
		},
	},
	{
		selector: "edge.option",
		style: {
			width: 4,
			"curve-style": "bezier",
			"line-style": "dashed",
			"line-dash-pattern": [4, 4],
			"line-color": "#9696ae",
			"target-arrow-color": "#9696ae",
			"source-arrow-color": "#9696ae",
			"target-arrow-shape": "triangle-tee",
			"z-index": 2,
		},
	},
	{
		selector: "edge.option:selected",
		style: {
			width: 6,
			"line-color": "#52526f",
			"target-arrow-color": "#52526f",
			"source-arrow-color": "#52526f",
		},
	},
	{
		selector: "edge.reference-value",
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
	{
		selector: "edge.reference-value:selected",
		style: {
			width: 5,
			"line-color": "dimgrey",
		},
	},
]
