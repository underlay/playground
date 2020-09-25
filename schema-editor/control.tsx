import { APG, parseSchemaString } from "apg"
import React from "react"
import jsonld from "jsonld"
import { useDebounce } from "use-debounce"

import { CircleLayout, TreeLayout } from "./style"

import {
	uriPlaceholder,
	namespacePattern,
	namespacePatternURL,
	DebounceDelay,
	compactTypeWithNamespace,
	cloneType,
	getId,
	makeLabelBackground,
	makeLiteralBackground,
} from "./utils"

const schemaSchemaURL = "lib/schema.schema.jsonld"
const schemaSchemaFile: Promise<APG.Schema> = fetch(schemaSchemaURL)
	.then((res) => res.json())
	.then(
		(doc) => new Map(doc["@graph"].map((type: APG.Type) => [type.id, type]))
	)

const contextURL = "lib/context.jsonld"
const contextFile = fetch(contextURL).then((res) => res.json())

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
		(types: APG.Schema, namespace: null | string) => {
			if (props.cy !== null) {
				props.cy.elements(":selected").unselect()
				props.cy.elements().remove()
				const elements: cytoscape.ElementDefinition[] = []
				for (const type of types.values()) {
					compactTypeWithNamespace(type, namespace)
					const id = type.id
					if (type.type === "label") {
						elements.push(
							{
								group: "nodes",
								classes: "label",
								data: { id, key: type.key, ...makeLabelBackground(type.key) },
							},
							{
								group: "edges",
								classes: "value",
								data: { id: getId(), source: id, target: type.value },
							}
						)
					} else if (type.type === "unit") {
						elements.push({ group: "nodes", classes: "unit", data: { id } })
					} else if (type.type === "iri") {
						elements.push({ group: "nodes", classes: "iri", data: { id } })
					} else if (type.type === "literal") {
						elements.push({
							group: "nodes",
							classes: "literal",
							data: {
								id,
								datatype: type.datatype,
								...makeLiteralBackground(type.datatype),
							},
						})
					} else if (type.type === "product") {
						elements.push({ group: "nodes", classes: "product", data: { id } })
						for (const component of type.components) {
							elements.push({
								group: "edges",
								classes: "component",
								data: {
									id: component.id,
									key: component.key,
									source: id,
									target: component.value,
								},
							})
						}
					} else if (type.type === "coproduct") {
						elements.push({
							group: "nodes",
							classes: "coproduct",
							data: { id },
						})
						for (const option of type.options) {
							elements.push({
								group: "edges",
								classes: "option",
								data: { id: option.id, source: option.value, target: id },
							})
						}
					}
				}

				props.cy
					.add(elements)
					.on("click", props.onClick)
					.layout(TreeLayout)
					.run()
				props.onChange(namespace)
			}
		},
		[props.onChange, props.cy, props.onClick]
	)

	const handleLoadExampleClick = React.useCallback(
		({}) => {
			schemaSchemaFile.then((schemaSchema) => {
				handleImport(
					new Map(
						Array.from(schemaSchema).map(([id, type]) => [id, cloneType(type)])
					),
					"http://underlay.org/ns/"
				)
			})
		},
		[props.onChange, props.cy]
	)

	const [exportUrl, setExportUrl] = React.useState<null | Error | string>(null)
	const handleExportClick = React.useCallback(
		({}) => {
			if (props.cy !== null) {
				const types: APG.Type[] = []
				const components: Map<string, APG.Component[]> = new Map()
				const options: Map<string, APG.Option[]> = new Map()
				props.cy.elements("edge.component, edge.option").forEach((edge) => {
					const id = `_:${edge.id()}`
					if (edge.hasClass("component")) {
						const key = edge.data("key")
						const value = `_:${edge.target().id()}`
						const product = `_:${edge.source().id()}`
						const cs = components.get(product)
						if (cs === undefined) {
							components.set(product, [{ id, type: "component", key, value }])
						} else {
							cs.push({ id, type: "component", key, value })
						}
					} else if (edge.hasClass("option")) {
						const value = `_:${edge.source().id()}`
						const coproduct = `_:${edge.target().id()}`
						const os = options.get(coproduct)
						if (os === undefined) {
							options.set(coproduct, [{ id, type: "option", value }])
						} else {
							os.push({ id, type: "option", value })
						}
					}
				})
				props.cy.elements("node").forEach((node) => {
					const id = `_:${node.id()}`
					if (node.hasClass("label")) {
						const key = node.data("key")
						const value = `_:${node.outgoers("node").id()}`
						types.push({ id, type: "label", key, value })
					} else if (node.hasClass("unit")) {
						types.push({ id, type: "unit" })
					} else if (node.hasClass("iri")) {
						types.push({ id, type: "iri" })
					} else if (node.hasClass("literal")) {
						const datatype = node.data("datatype")
						types.push({ id, type: "literal", datatype })
					} else if (node.hasClass("product")) {
						types.push({ id, type: "product", components: components.get(id)! })
					} else if (node.hasClass("coproduct")) {
						types.push({ id, type: "coproduct", options: options.get(id)! })
					}
				})
				;(async function () {
					const context = await contextFile
					const doc = { ...context, "@graph": types }
					const options: jsonld.Options.Normalize =
						props.namespace === null
							? { algorithm: "URDNA2015" }
							: { algorithm: "URDNA2015", base: props.namespace }
					const normalized = await jsonld.normalize(doc, options)
					const fileName = `schema-${new Date().toISOString()}.nq`
					const file = new File([normalized], fileName, {
						type: "application/n-quads",
					})
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
				Promise.all([schemaSchemaFile, file.text()]).then(
					([schemaSchema, input]) => {
						const labels = parseSchemaString(input, schemaSchema)
						if (labels._tag === "Right") {
							console.log("Successfully imported schema", labels.right)
							handleImport(labels.right, null)
						} else {
							console.error("Failed to import schema", labels.left)
						}
					}
				)
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
