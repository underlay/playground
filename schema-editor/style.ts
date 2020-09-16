import cytoscape from "cytoscape"

export type LayoutOptions = {
	circle: boolean
	directed: boolean
	inverted: boolean
}

export const MakeLayout = ({
	circle,
	directed,
	inverted,
}: LayoutOptions): cytoscape.LayoutOptions =>
	({
		name: "breadthfirst",
		padding: 12,
		animate: false,
		spacingFactor: 1.5,
		maximal: !inverted,
		circle,
		directed,
	} as cytoscape.LayoutOptions)

export const Style: cytoscape.Stylesheet[] = [
	{
		selector: "node",
		style: {
			"border-width": 1,
			"border-style": "solid",
			"border-color": "#95a482",
		},
	},
	{
		selector: "node.label",
		style: {
			"border-width": 1,
			width: "data(width)",
			height: "data(height)",
			"background-image": "data(svg)",
			shape: "round-rectangle",
			"background-color": "seashell",
			"border-color": "dimgrey",
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
		},
	},
	{
		selector: "node.reference",
		style: {
			width: 20,
			height: 20,
			shape: "ellipse",
			"background-color": "mistyrose",
		},
	},
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
	{
		selector: "edge.definition",
		style: {
			width: 3,
			"curve-style": "straight",
			"line-style": "solid",
			"line-color": "dimgrey",
			"target-arrow-color": "dimgrey",
			"source-arrow-color": "dimgrey",
			"z-index": 2,
		},
	},
	{
		selector: "edge.component",
		style: {
			width: 4,
			label: "data(key)",
			"curve-style": "straight",
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
		selector: "edge.option",
		style: {
			width: 4,
			"curve-style": "straight",
			"line-style": "dashed",
			"line-dash-pattern": [4, 4],
			"line-color": "#9696ae",
			"target-arrow-color": "#9696ae",
			"source-arrow-color": "#9696ae",
			"source-arrow-shape": "tee",
			"target-arrow-shape": "triangle",
			"z-index": 2,
		},
	},
	{
		selector: "node.focus",
		style: {
			"border-width": 3,
		},
	},
	{
		selector: "edge.focus",
		style: {
			// width: 3,
		},
	},
]

export const FooterStyle: cytoscape.Stylesheet[] = [
	{
		selector: "node",
		style: {
			"font-family": "serif",
			"font-size": "13px",
			"border-width": 1,
			"border-style": "solid",
			"border-color": "#95a482",
		},
	},
	{
		selector: "#label",
		style: {
			label: "Label",
			"border-width": 1,
			width: 60,
			height: 20,
			shape: "round-rectangle",
			"background-color": "seashell",
			"border-color": "dimgrey",
		},
	},
	{
		selector: "#literal",
		style: {
			label: "Literal",
			width: 80,
			height: 20,
			shape: "rectangle",
			"background-color": "lightyellow",
		},
	},
	{
		selector: "#product",
		style: {
			label: "Product",
			shape: "hexagon",
			width: 36,
			height: 30,
			"background-color": "aliceblue",
			"border-color": "lightslategrey",
		},
	},
	{
		selector: "#coproduct",
		style: {
			label: "Coproduct",
			shape: "round-hexagon",
			width: 36,
			height: 30,
			"background-color": "lavender",
			"border-color": "#9696ae",
		},
	},
	{
		selector: "#unit",
		style: {
			label: "Unit",
			width: 20,
			height: 20,
			shape: "ellipse",
			"background-color": "#ccc",
			"border-color": "grey",
		},
	},
	{
		selector: "#iri",
		style: {
			label: "Iri",
			shape: "diamond",
			"background-color": "darkseagreen",
		},
	},
	{
		selector: "#reference",
		style: {
			label: "Label reference",
			width: 20,
			height: 20,
			shape: "ellipse",
			"background-color": "mistyrose",
		},
	},
]
