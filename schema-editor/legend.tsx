import React from "react"

import cytoscape from "cytoscape"
import { APG } from "apg"

const FooterStyle: cytoscape.Stylesheet[] = [
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
			"border-color": "#5e735e",
		},
	},
]

const attachFooterRef = (onSelect: (type: APG.Type["type"]) => void) => (
	container: HTMLDivElement
) => {
	if (container !== null) {
		const cy = cytoscape({
			container,
			style: FooterStyle,
			userPanningEnabled: false,
			userZoomingEnabled: false,
			autoungrabify: true,
			autounselectify: true,
			boxSelectionEnabled: false,
			zoom: 1,
			layout: { name: "grid", fit: true, padding: 10 },
			elements: [
				{ group: "nodes", data: { id: "label" } },
				{ group: "nodes", data: { id: "unit" } },
				{ group: "nodes", data: { id: "iri" } },
				{ group: "nodes", data: { id: "literal" } },
				{ group: "nodes", data: { id: "product" } },
				{ group: "nodes", data: { id: "coproduct" } },
			],
		})
		cy.elements().on("click", ({ target }) => onSelect(target.id()))
	}
}

export function Legend(props: { onSelect: (type: APG.Type["type"]) => void }) {
	return <footer ref={attachFooterRef(props.onSelect)}></footer>
}
