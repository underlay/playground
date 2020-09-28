import { APG, parseSchemaString } from "apg"
import React from "react"
import jsonld from "jsonld"
import { useDebounce } from "use-debounce"
import { Either } from "fp-ts/Either"

import "apg/context.jsonld"
import "apg/schema.schema.json"

import { CircleLayout, TreeLayout } from "./style"

import {
	uriPlaceholder,
	namespacePattern,
	namespacePatternURL,
	DebounceDelay,
	compactTypeWithNamespace,
	getId,
	makeLabelBackground,
	makeLiteralBackground,
} from "./utils"

const toPromise = <L, R>(option: Either<L, R>) =>
	option._tag === "Left"
		? Promise.reject(option.left)
		: Promise.resolve(option.right)

const schemaSchemaURL = "lib/schema.schema.json"
const schemaSchemaParser = fetch(schemaSchemaURL)
	.then((res) => res.json())
	.then((doc) => toPromise(APG.codec.decode(doc)))
	.then(APG.codec.encode)

const contextURL = "lib/context.jsonld"
const contextFile = fetch(contextURL).then((res) => res.json())

const getValue = (ele: cytoscape.NodeSingular): string | APG.Reference =>
	ele.hasClass("reference")
		? Object.freeze({
				type: "reference",
				value: ele.outgoers("edge.reference-value").target().id(),
		  })
		: ele.id()

export function Control(props: {
	namespace: null | string
	cy: cytoscape.Core | null
	onChange: (namespace: null | string) => void
	onClick: cytoscape.EventHandler
}) {
	const [value, setValue] = React.useState<null | string>(props.namespace)

	const handleUseNamespaceChange = React.useCallback(
		({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) =>
			props.onChange(checked ? "" : null),
		[props.onChange]
	)

	const handleNamespaceChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setValue(value),
		[]
	)

	const [namespace] = useDebounce(value, DebounceDelay)
	const updateNamespace = React.useCallback(
		(namespace: null | string) => {
			if (namespace !== props.namespace) {
				props.onChange(namespace)
			}
		},
		[props.namespace, props.onChange]
	)

	React.useEffect(() => updateNamespace(namespace), [namespace])
	React.useEffect(() => setValue(props.namespace), [props.namespace])

	const handleImport = React.useCallback(
		(schema: APG.Schema, namespace: null | string) => {
			if (props.cy !== null) {
				const elements: cytoscape.ElementDefinition[] = []
				for (const [id, label] of schema.labels) {
					const key = compactTypeWithNamespace(label.key, namespace)
					const node: cytoscape.ElementDefinition = {
						group: "nodes",
						classes: "label",
						data: { id, key, ...makeLabelBackground(key) },
					}
					if (typeof label.value === "string") {
						elements.push(node, {
							group: "edges",
							classes: "value",
							data: { id: getId(), source: id, target: label.value },
						})
					} else {
						const referenceId = getId()
						elements.push(
							node,
							{
								group: "edges",
								classes: "value",
								data: { id: getId(), source: id, target: referenceId },
							},
							{
								group: "nodes",
								classes: "reference",
								data: { id: referenceId },
							},
							{
								group: "edges",
								classes: "reference-value",
								data: {
									id: getId(),
									source: referenceId,
									target: label.value.value,
								},
							}
						)
					}
				}
				for (const [id, type] of schema.types) {
					if (type.type === "unit") {
						elements.push({ group: "nodes", classes: "unit", data: { id } })
					} else if (type.type === "iri") {
						elements.push({ group: "nodes", classes: "iri", data: { id } })
					} else if (type.type === "literal") {
						const datatype = compactTypeWithNamespace(type.datatype, namespace)
						elements.push({
							group: "nodes",
							classes: "literal",
							data: { id, datatype, ...makeLiteralBackground(datatype) },
						})
					} else if (type.type === "product") {
						elements.push({ group: "nodes", classes: "product", data: { id } })
						for (const [componentId, component] of type.components) {
							const key = compactTypeWithNamespace(component.key, namespace)
							if (typeof component.value === "string") {
								elements.push({
									group: "edges",
									classes: "component",
									data: {
										id: componentId,
										key,
										source: id,
										target: component.value,
									},
								})
							} else {
								const referenceId = getId()
								elements.push(
									{
										group: "edges",
										classes: "component",
										data: {
											id: componentId,
											key,
											source: id,
											target: referenceId,
										},
									},
									{
										group: "nodes",
										classes: "reference",
										data: { id: referenceId },
									},
									{
										group: "edges",
										classes: "reference-value",
										data: {
											id: getId(),
											source: referenceId,
											target: component.value.value,
										},
									}
								)
							}
						}
					} else if (type.type === "coproduct") {
						elements.push({
							group: "nodes",
							classes: "coproduct",
							data: { id },
						})
						for (const [optionId, option] of type.options) {
							if (typeof option.value === "string") {
								elements.push({
									group: "edges",
									classes: "option",
									data: { id: optionId, source: option.value, target: id },
								})
							} else {
								const referenceId = getId()
								elements.push(
									{
										group: "edges",
										classes: "option",
										data: { id: optionId, source: referenceId, target: id },
									},
									{
										group: "nodes",
										classes: "reference",
										data: { id: referenceId },
									},
									{
										group: "edges",
										classes: "reference-value",
										data: {
											id: getId(),
											source: referenceId,
											target: option.value.value,
										},
									}
								)
							}
						}
					}
				}

				props.cy.startBatch()
				props.cy.elements(":selected").unselect()
				props.cy.elements().remove()
				const eles = props.cy.add(elements)
				eles
					.difference(props.cy.elements("edge, node.reference"))
					.on("click", props.onClick)
				eles.layout(TreeLayout).run()
				props.cy.endBatch()
				props.onChange(namespace)
			}
		},
		[props.onChange, props.cy, props.onClick]
	)

	const handleLoadExampleClick = React.useCallback(
		({}) => {
			schemaSchemaParser.then((schemaSchema) =>
				handleImport(schemaSchema, "http://underlay.org/ns/")
			)
		},
		[props.onChange, props.cy]
	)

	const [exportUrl, setExportUrl] = React.useState<null | Error | string>(null)
	const handleExportClick = React.useCallback(
		({}) => {
			if (props.cy !== null) {
				const labels: Map<string, APG.Label> = new Map()
				const types: Map<string, APG.Type> = new Map()
				const components: Map<string, Map<string, APG.Component>> = new Map()
				const options: Map<string, Map<string, APG.Option>> = new Map()
				props.cy.elements("edge.component, edge.option").forEach((edge) => {
					const id = `_:${edge.id()}`
					if (edge.hasClass("component")) {
						const key = edge.data("key")
						const value = getValue(edge.target())
						const product = edge.source().id()
						const cs = components.get(product)
						if (cs === undefined) {
							components.set(
								product,
								new Map([
									[id, Object.freeze({ type: "component", key, value })],
								])
							)
						} else {
							cs.set(id, Object.freeze({ type: "component", key, value }))
						}
					} else if (edge.hasClass("option")) {
						const value = getValue(edge.source())
						const coproduct = edge.target().id()
						const os = options.get(coproduct)
						if (os === undefined) {
							options.set(
								coproduct,
								new Map([[id, Object.freeze({ type: "option", value })]])
							)
						} else {
							os.set(id, Object.freeze({ type: "option", value }))
						}
					}
				})
				props.cy.elements("node").forEach((node) => {
					const id = node.id()
					if (node.hasClass("label")) {
						const key = node.data("key")
						const value = getValue(node.outgoers("edge.value").target())
						labels.set(id, Object.freeze({ type: "label", key, value }))
					} else if (node.hasClass("unit")) {
						types.set(id, Object.freeze({ type: "unit" }))
					} else if (node.hasClass("iri")) {
						types.set(id, Object.freeze({ type: "iri" }))
					} else if (node.hasClass("literal")) {
						const datatype = node.data("datatype")
						types.set(id, Object.freeze({ type: "literal", datatype }))
					} else if (node.hasClass("product")) {
						types.set(
							id,
							Object.freeze({
								type: "product",
								components: components.get(id) || new Map(),
							})
						)
					} else if (node.hasClass("coproduct")) {
						types.set(
							id,
							Object.freeze({
								type: "coproduct",
								options: options.get(id) || new Map(),
							})
						)
					}
				})
				console.log("schema", labels, types)
				const json = APG.toJSON(Object.freeze({ labels, types }))
				console.log("json", json)
				;(async function () {
					const context = await contextFile
					const doc = {
						...context,
						"@graph": json,
					}
					const options: jsonld.Options.Normalize =
						props.namespace === null
							? { algorithm: "URDNA2015" }
							: { algorithm: "URDNA2015", base: props.namespace }
					const normalized = await jsonld.normalize(doc, options)
					const fileName = `schema-${new Date().toISOString()}.nq`
					const file = new File([normalized], fileName, { type: "text/plain" })
					setExportUrl(URL.createObjectURL(file))
				})()
			}
		},
		[props.namespace, props.cy]
	)

	const handleImportChange = React.useCallback(
		({ target: { files } }: React.ChangeEvent<HTMLInputElement>) => {
			if (files !== null && files.length === 1) {
				const [file] = files
				Promise.all([schemaSchemaParser, file.text()])
					.then(([schemaSchema, input]) =>
						toPromise(parseSchemaString(input, schemaSchema))
					)
					.then((schema) => handleImport(schema, null))
					.catch((error) => console.error("Failed to import schema", error))
			}
		},
		[props.cy]
	)

	const handleReset = React.useCallback(
		({}) => {
			if (props.cy !== null) {
				props.cy.reset()
			}
		},
		[props.cy]
	)

	const handleLayout = React.useCallback(
		({ target }: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			if (props.cy !== null) {
				const { id } = target as HTMLButtonElement
				if (id === "tree") {
					props.cy.elements().layout(TreeLayout).run()
				} else if (id === "circle") {
					props.cy.elements().layout(CircleLayout).run()
				}
			}
		},
		[props.cy]
	)

	return (
		<React.Fragment>
			<div className="control">
				<div className="io">
					<input
						type="file"
						onChange={handleImportChange}
						accept=".nq,application/n-quads,.nt,application/n-triples"
					/>
					{exportUrl === null ? (
						<button onClick={handleExportClick} disabled={props.cy === null}>
							Export
						</button>
					) : exportUrl instanceof Error ? (
						<span className="error">{exportUrl.toString()}</span>
					) : (
						<a href={exportUrl}>Download</a>
					)}
				</div>
				<hr />
				<div className="layout">
					<button disabled={props.cy === null} onClick={handleReset}>
						Reset viewport
					</button>
					<button id="tree" disabled={props.cy === null} onClick={handleLayout}>
						Tree layout
					</button>
					<button
						id="circle"
						disabled={props.cy === null}
						onClick={handleLayout}
					>
						Circle layout
					</button>
					<button onClick={handleLoadExampleClick}>Load example</button>
				</div>
				<hr />
				<label>
					<span>Namespace</span>
					<input
						type="checkbox"
						checked={value !== null}
						onChange={handleUseNamespaceChange}
					/>
				</label>
				{value !== null && (
					<input
						className="uri"
						type="text"
						value={value}
						placeholder={uriPlaceholder}
						onChange={handleNamespaceChange}
					/>
				)}
			</div>
			{value !== null && !namespacePattern.test(value) && (
				<div className="error">
					<span>Namespace value must match </span>
					<a href={namespacePatternURL}>this pattern</a>
				</div>
			)}
		</React.Fragment>
	)
}
