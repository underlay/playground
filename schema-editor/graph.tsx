import React from "react"

import cytoscape from "cytoscape"

import { APG, isReference } from "apg/lib/schema.js"

import { makeComponentId } from "./product"
import { makeOptionId } from "./coproduct"
import { xsdDatatypes } from "./utils"
import { Style, MakeLayout, LayoutOptions, FooterStyle } from "./style"

const FONT_FAMILY = "monospace"
const FONT_SIZE = 12
const CHAR = 7.2
const LINE_HEIGHT = 20

const DataURIPrefix = "data:image/svg+xml;utf8,"

const makeBackground = (content: string, width: number, height: number) => ({
	width,
	height,
	svg:
		DataURIPrefix +
		encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
<svg width="${width}" height="${height}"
viewBox="0 0 ${width} ${height}"
fill="none"
xmlns="http://www.w3.org/2000/svg"
font-size="${FONT_SIZE}"
font-family="${FONT_FAMILY}">
<style>text { fill: black }</style>
${content}
</svg>`),
})

function makeLabelBackground(label: APG.Label) {
	const width = Math.max(CHAR * label.key.length + 12, 20),
		height = LINE_HEIGHT

	return makeBackground(
		`<g><text x="6" y="14">${label.key}</text></g>`,
		width,
		height
	)
}

function makeLiteralBackground(literal: APG.Literal) {
	const name = xsdDatatypes.includes(literal.datatype)
		? `[${literal.datatype.slice(literal.datatype.lastIndexOf("#") + 1)}]`
		: `<${literal.datatype}>`

	const width = CHAR * name.length + 8,
		height = LINE_HEIGHT

	const text = name.replace(/</g, "&lt;").replace(/>/g, "&gt;")
	return makeBackground(
		`<g><text x="4" y="13">${text}</text></g>`,
		width,
		height
	)
}

function makeElements(
	labels: APG.Label[],
	options: LayoutOptions
): cytoscape.ElementDefinition[] {
	const elements: cytoscape.ElementDefinition[] = []
	for (const label of labels) {
		const id = label.id.slice(2)
		const background = makeLabelBackground(label)
		elements.push({
			group: "nodes",
			classes: "label",
			data: { id, key: label.key, ...background },
		})

		const target = makeTypeElement(id, label.value, elements, options)

		elements.push({
			group: "edges",
			classes: "definition",
			data: {
				id: `${id}-def`,
				key: label.key,
				source: id,
				target: target,
			},
		})
	}
	return elements
}

function makeTypeElement(
	parent: string,
	type: APG.Type,
	elements: cytoscape.ElementDefinition[],
	options: LayoutOptions
): string {
	const id = `${parent}-val`
	if (isReference(type)) {
		// return type.id.slice(2)
		const [source, target] = [type.id.slice(2), id]
		elements.push(
			{
				group: "nodes",
				classes: "reference",
				data: { type: "reference", id },
			},
			{
				group: "edges",
				classes: "reference",
				data: {
					type: "reference",
					id: `${parent}-ref`,
					source: options.inverted ? target : source,
					target: options.inverted ? source : target,
				},
			}
		)
	} else if (type.type === "unit") {
		elements.push({
			group: "nodes",
			classes: "unit",
			data: { type: type.type, id },
		})
	} else if (type.type === "iri") {
		elements.push({
			group: "nodes",
			classes: "iri",
			data: { type: type.type, id },
		})
	} else if (type.type === "literal") {
		const background = makeLiteralBackground(type)
		elements.push({
			group: "nodes",
			classes: "literal",
			data: {
				type: type.type,
				id,
				datatype: type.datatype,
				...background,
			},
		})
	} else if (type.type === "product") {
		elements.push({
			group: "nodes",
			classes: "product",
			data: { type: type.type, id },
		})
		for (const component of makeComponentId(type.components)) {
			const componentId = component.id.slice(2)
			const target = makeTypeElement(
				componentId,
				component.value,
				elements,
				options
			)
			elements.push({
				group: "edges",
				classes: "component",
				data: {
					type: component.type,
					id: componentId,
					key: component.key,
					source: id,
					target: target,
				},
			})
		}
	} else if (type.type === "coproduct") {
		elements.push({
			group: "nodes",
			classes: "coproduct",
			data: { type: type.type, id },
		})
		for (const option of makeOptionId(type.options)) {
			const optionId = option.id.slice(2)
			const target = makeTypeElement(optionId, option.value, elements, options)
			elements.push({
				group: "edges",
				classes: "option",
				data: {
					type: option.type,
					id: optionId,
					source: id,
					target: target,
				},
			})
		}
	} else {
		throw new Error("Invalid type value")
	}
	return id
}

export function Graph(props: {
	labels: APG.Label[]
	// focus: null | string
	// onFocus: (id: string | null) => void
}) {
	const [cy, setCy] = React.useState<null | cytoscape.Core>(null)
	const [circle, setCircle] = React.useState(true)
	const [directed, setDirected] = React.useState(true)
	const [inverted, setInverted] = React.useState(true)

	const attachRef = React.useCallback(
		(container: HTMLDivElement) => {
			if (container === null) {
				return
			} else if (cy !== null) {
				return
			}

			const nextCy = cytoscape({
				container,
				style: Style,
				// userPanningEnabled: false,
				// userZoomingEnabled: false,
				// autoungrabify: true,
				zoom: 1,
				maxZoom: 2,
				minZoom: 0.5,
			})

			;(window as any).cy = nextCy

			setCy(nextCy)
		},
		[props.labels]
	)

	React.useEffect(() => {
		if (cy !== null) {
			const options = { circle, directed, inverted: directed && inverted }
			cy.batch(() => {
				cy.elements().remove()
				cy.add(makeElements(props.labels, options))
				cy.elements("node, edge").layout(MakeLayout(options)).run()
			})
		}
	}, [props.labels, cy, circle, directed, inverted])

	// React.useEffect(() => {
	// 	if (cy !== null) {
	// 		if (props.focus === null) {
	// 			cy.elements(`.focus`).removeClass("focus")
	// 		} else {
	// 			const eles = cy.elements(`[id = "${props.focus.slice(2)}"]`)
	// 			eles.addClass("focus")
	// 			// console.log("eles", cy.elements(`#${props.focus.slice(2)}`).classes())
	// 		}
	// 	}
	// }, [cy, props.focus, props.onFocus])

	const handleCircleChange = React.useCallback(
		({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) =>
			setCircle(checked),
		[]
	)

	const handleDirectedChange = React.useCallback(
		({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) =>
			setDirected(checked),
		[]
	)

	const handleInvertedChange = React.useCallback(
		({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) =>
			setInverted(checked),
		[]
	)

	const attachFooterRef = React.useCallback((container: HTMLDivElement) => {
		if (container !== null) {
			cytoscape({
				container,
				style: FooterStyle,
				userPanningEnabled: false,
				userZoomingEnabled: false,
				autoungrabify: true,
				autounselectify: true,
				zoom: 1,
				layout: { name: "grid", padding: 0 },
				elements: [
					{ group: "nodes", data: { id: "label" } },
					{ group: "nodes", data: { id: "reference" } },
					{ group: "nodes", data: { id: "unit" } },
					{ group: "nodes", data: { id: "iri" } },
					{ group: "nodes", data: { id: "literal" } },
					{ group: "nodes", data: { id: "product" } },
					{ group: "nodes", data: { id: "coproduct" } },
				],
			})
		}
	}, [])

	return (
		<React.Fragment>
			<nav>
				<label>
					<span>Circle</span>
					<input
						type="checkbox"
						checked={circle}
						onChange={handleCircleChange}
					/>
				</label>
				<label>
					<span>Sort</span>
					<input
						type="checkbox"
						checked={directed}
						onChange={handleDirectedChange}
					/>
				</label>
				{directed && (
					<label>
						<span>Invert references</span>
						<input
							type="checkbox"
							checked={inverted}
							onChange={handleInvertedChange}
						/>
					</label>
				)}
			</nav>
			<div className="container" ref={attachRef} />
			<footer ref={attachFooterRef}></footer>
		</React.Fragment>
	)
}
