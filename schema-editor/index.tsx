import React from "react"
import ReactDOM from "react-dom"

import cytoscape from "cytoscape"

import "apg/context.jsonld"
import "apg/schema.schema.jsonld"

import { APG } from "apg"

import { Control } from "./control"
import { Legend } from "./legend"
import { Style } from "./style"
import { xsd } from "n3.ts"
import LiteralEditor from "./literal"
import LabelEditor from "./label"
import ComponentEditor from "./component"
import {
	getId,
	isMeta,
	Meta,
	makeLabelBackground,
	makeLiteralBackground,
} from "./utils"

const main = document.querySelector("main")

const schemaSchemaURL = "lib/schema.schema.jsonld"
const schemaSchemaFile = fetch(schemaSchemaURL).then((res) => res.json())
const contextURL = "lib/context.jsonld"
const contextFile = fetch(contextURL).then((res) => res.json())
const defaultNamespace = "http://example.com/ns/"

const cyOptions: cytoscape.CytoscapeOptions = {
	style: Style,
	zoom: 1,
	maxZoom: 2,
	minZoom: 0.5,
	boxSelectionEnabled: false,
}

const randomLayout = (cy: cytoscape.Core): cytoscape.RandomLayoutOptions => ({
	name: "random",
	fit: false,
	boundingBox: { x1: 40, y1: 40, w: cy.width() - 80, h: cy.height() - 80 },
})

const placementRadius = 160

function addComponentOrOption(
	ele: cytoscape.CollectionReturnValue,
	classes: "component" | "option",
	onClick: cytoscape.EventHandler,
	cy: cytoscape.Core
) {
	const pos = ele.position()
	const angle = Math.random() * 2 * Math.PI
	const x = Math.cos(angle) * placementRadius
	const y = Math.sin(angle) * placementRadius
	const id = getId()
	const node = cy.add({
		group: "nodes",
		classes: "unit",
		data: { id },
		position: { x: pos.x + x, y: pos.y + y },
	})
	node.on("click", onClick)
	const [source, target] =
		classes === "component" ? [ele.id(), id] : [id, ele.id()]
	const key = classes === "component" ? { key: "" } : {}
	const edge = cy.add({
		group: "edges",
		classes: classes,
		data: { id: getId(), source, target, ...key },
	})
	edge.on("click", onClick)
	edge.select()
}

function addElement(
	type: APG.Type["type"],
	onClick: cytoscape.EventHandler,
	cy: cytoscape.Core
) {
	const id = getId()
	cy.startBatch()
	if (type === "label") {
		const valueId = getId()
		const data = { id, key: "", ...makeLabelBackground("") }
		const ele = cy.add({ group: "nodes", classes: type, data })
		ele.layout(randomLayout(cy)).run()
		ele.on("click", onClick)
		const { x, y } = cy.getElementById(id).position()
		cy.add({
			group: "nodes",
			classes: "unit",
			data: { id: valueId },
			position: { x, y: y + 50 },
		})
		cy.add({
			group: "edges",
			classes: "value",
			data: { id: getId(), source: id, target: valueId },
		}).on("click", onClick)
	} else if (type === "unit") {
		const ele = cy.add({ group: "nodes", classes: type, data: { id } })
		ele.layout(randomLayout(cy)).run()
		ele.on("click", onClick)
	} else if (type === "iri") {
		const ele = cy.add({ group: "nodes", classes: type, data: { id } })
		ele.layout(randomLayout(cy)).run()
		ele.on("click", onClick)
	} else if (type === "literal") {
		const datatype = xsd.string
		const data = { id, datatype, ...makeLiteralBackground(xsd.string) }
		const ele = cy.add({ group: "nodes", classes: type, data })
		ele.layout(randomLayout(cy)).run()
		ele.on("click", onClick)
	} else if (type === "product") {
		const ele = cy.add({ group: "nodes", classes: type, data: { id } })
		ele.layout(randomLayout(cy)).run()
		ele.on("click", onClick)
	} else if (type === "coproduct") {
		const ele = cy.add({ group: "nodes", classes: type, data: { id } })
		ele.layout(randomLayout(cy)).run()
		ele.on("click", onClick)
	}

	cy.elements(":selected").unselect()
	cy.getElementById(id).select()
	cy.endBatch()
}

function removeElement(
	ele: cytoscape.CollectionReturnValue,
	cy: cytoscape.Core
) {
	if (ele.group() === "nodes") {
		ele.incomers(".value").forEach((v) => {
			const { x, y } = v.source().position()
			const id = getId()
			cy.add({
				group: "nodes",
				classes: "unit",
				data: { id: id },
				position: { x, y: y + 50 },
			})
			v.move({ target: id })
		})
		if (ele.hasClass("label")) {
			const value = ele.outgoers("node")
			if (
				value.hasClass("unit") &&
				value.indegree(true) === 1 &&
				value.outdegree(true) === 0
			) {
				value.remove()
			}
		}
	} else if (ele.hasClass("component")) {
		const value = ele.target()
		if (
			value.hasClass("unit") &&
			value.indegree(true) === 1 &&
			value.outdegree(true) === 0
		) {
			value.remove()
		}
	} else if (ele.hasClass("option")) {
		const value = ele.source()
		if (
			value.hasClass("unit") &&
			value.outdegree(true) === 1 &&
			value.indegree(true) === 0
		) {
			value.remove()
		}
	}
}

function Index({}) {
	const [focus, setFocus] = React.useState<null | string>(null)
	const [namespace, setNamespace] = React.useState<null | string>(
		defaultNamespace
	)

	const focusRef = React.useRef<null | cytoscape.CollectionReturnValue>(null)
	const [cy, setCy] = React.useState<cytoscape.Core | null>(null)

	React.useEffect(() => {
		if (cy !== null) {
			const onKeyDown = (event: KeyboardEvent) => {
				if (event.key === "Backspace" && isMeta(event)) {
					if (focusRef.current === null) {
					} else if (focusRef.current.hasClass("value")) {
					} else {
						removeElement(focusRef.current, cy)
						focusRef.current.remove()
						focusRef.current = null
						setFocus(null)
					}
				}
			}

			window.addEventListener("keydown", onKeyDown)

			const onBeforeUnload = (event: BeforeUnloadEvent) =>
				event.preventDefault()
			window.addEventListener("beforeunload", onBeforeUnload)

			return () => {
				window.removeEventListener("keydown", onKeyDown)
				window.removeEventListener("beforeunload", onBeforeUnload)
			}
		}
	}, [cy])

	const handleElementClick = React.useCallback(
		(event: cytoscape.EventObject) => {
			const { target, originalEvent } = event
			if (
				isMeta(originalEvent) &&
				focusRef.current !== null &&
				target.isNode()
			) {
				if (focusRef.current.id() === target.id()) {
					if (target.hasClass("product")) {
						addComponentOrOption(target, "component", handleElementClick, cy!)
					} else if (target.hasClass("coproduct")) {
						addComponentOrOption(target, "option", handleElementClick, cy!)
					}
				} else {
					if (focusRef.current.hasClass("option")) {
						const s = focusRef.current.source()
						focusRef.current.move({ source: target.id() })
						if (
							s.hasClass("unit") &&
							s.indegree(true) === 0 &&
							s.outdegree(true) === 0
						) {
							s.remove()
						}
					} else if (focusRef.current.hasClass("component")) {
						const t = focusRef.current.target()
						focusRef.current.move({ target: target.id() })
						if (
							t.hasClass("unit") &&
							t.indegree(true) === 0 &&
							t.outdegree(true) === 0
						) {
							t.remove()
						}
					} else if (focusRef.current.hasClass("value")) {
						const t = focusRef.current.target()
						focusRef.current.move({ target: target.id() })
						if (
							t.hasClass("unit") &&
							t.indegree(true) === 0 &&
							t.outdegree(true) === 0
						) {
							t.remove()
						}
					}
					focusRef.current.unselect()
				}
			}
		},
		[cy]
	)

	const handleAddElement = React.useCallback(
		(type: APG.Type["type"]) => cy && addElement(type, handleElementClick, cy),
		[cy]
	)

	const handleSelect = React.useCallback(
		(target: cytoscape.CollectionReturnValue) => {
			focusRef.current = target
			setFocus(target.id())
		},
		[]
	)

	const handleUnselect = React.useCallback(
		(target: cytoscape.CollectionReturnValue) => {
			if (focusRef.current !== null && focusRef.current.id() === target.id()) {
				focusRef.current = null
				setFocus(null)
			}
		},
		[]
	)

	const attachRef = React.useCallback((container: HTMLDivElement | null) => {
		if (container === null) {
			return
		} else {
			const cy = cytoscape({ container, ...cyOptions })
			cy.on("select", ({ target }) => handleSelect(target))
			cy.on("unselect", ({ target }) => handleUnselect(target))
			;(window as any).cy = cy
			setCy(cy)
		}
	}, [])

	const ele = focus !== null && cy !== null ? cy.getElementById(focus) : null

	return (
		<React.Fragment>
			<div className="panels">
				<section className="graph" ref={attachRef}></section>
				<section className="editor">
					<Legend onSelect={handleAddElement} />
					<Control
						namespace={namespace}
						cy={cy}
						onChange={setNamespace}
						onClick={handleElementClick}
					/>
					{ele === null ? (
						<React.Fragment>
							<p>Click on types in the legend to add instances to the graph</p>
							<p>Click on elements in the graph to select them</p>
						</React.Fragment>
					) : (
						<TypeDispatch ele={ele} namespace={namespace} cy={cy!} />
					)}
				</section>
			</div>
		</React.Fragment>
	)
}

declare module "cytoscape" {
	interface CollectionStyle {
		classes(): string[]
		classes(classList: string): void
		classes(classList: string[]): void
	}

	// interface BreadthFirstLayoutOptions {
	// 	roots?: string | cytoscape.CollectionReturnValue
	// }
}

function TypeDispatch(props: {
	ele: cytoscape.CollectionReturnValue
	namespace: string | null
	cy: cytoscape.Core
}) {
	const [type] = props.ele.classes()
	if (type === "label") {
		return (
			<LabelEditor ele={props.ele} namespace={props.namespace} cy={props.cy} />
		)
	} else if (type === "unit") {
		return (
			<div className="type unit">
				<h2>Unit</h2>
				<p>{Meta}-Backspace to delete</p>
			</div>
		)
	} else if (type === "iri") {
		return (
			<div className="type iri">
				<h2>Iri</h2>
				<p>{Meta}-Backspace to delete</p>
			</div>
		)
	} else if (type === "literal") {
		return <LiteralEditor ele={props.ele} />
	} else if (type === "product") {
		return (
			<div className="type product">
				<h2>Product</h2>
				<p>{Meta}-Click to add a component</p>
				<p>{Meta}-Backspace to delete</p>
			</div>
		)
	} else if (type === "coproduct") {
		return (
			<div className="type coproduct">
				<h2>Coproduct</h2>
				<p>{Meta}-Click to add an option</p>
				<p>{Meta}-Backspace to delete</p>
			</div>
		)
	} else if (type === "component") {
		return <ComponentEditor ele={props.ele} namespace={props.namespace} />
	} else if (type === "option") {
		return (
			<div className="type option">
				<h2>Option</h2>
				<p>{Meta}-Click on another node to set the option value</p>
				<p>{Meta}-Backspace to delete</p>
			</div>
		)
	} else if (type === "value") {
		return (
			<div className="type value">
				<h2>Value</h2>
				<p>{Meta}-Click on another node to set the label value</p>
			</div>
		)
	}
	return null
}

ReactDOM.render(<Index />, main)
