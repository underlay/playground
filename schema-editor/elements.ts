import { APG, getKeys, signalInvalidType } from "@underlay/apg"
import { errorUnit } from "@underlay/apg-schema-codemirror"
import cytoscape from "cytoscape"

import { makeLabelBackground, makeLiteralBackground } from "./background"

type G = () => string
function generator(): G {
	let i = 0
	return () => `t${i++}`
}

export function makeElements(
	schema: APG.Schema,
	namespaces: Record<string, string>
): cytoscape.ElementDefinition[] {
	const elements: cytoscape.ElementDefinition[] = []

	const g = generator()
	const map = new Map<APG.Type, string>()
	const keys = getKeys(schema)
	for (const [i, key] of keys.entries()) {
		const id = `l${i}`
		const label = getURI(namespaces, key)
		const { width, height } = makeLabelBackground(label)
		elements.push({
			group: "nodes",
			data: { id, key: label, width, height },
			classes: "label",
		})

		const type = schema[key]
		const value = makeTypeElement(schema, namespaces, elements, g, map, type)

		elements.push({
			group: "edges",
			data: { id: `l${i}-0`, source: id, target: value },
			classes: "type",
		})
	}

	return elements
}

function makeTypeElement(
	schema: APG.Schema,
	namespaces: Record<string, string>,
	elements: cytoscape.ElementDefinition[],
	g: G,
	map: Map<APG.Type, string>,
	type: APG.Type
): string {
	if (map.has(type)) {
		return map.get(type)!
	} else {
		const id = g()
		map.set(type, id)

		const data = { id, ...getTypeData(namespaces, type) }
		const element: cytoscape.ElementDefinition = {
			group: "nodes",
			data,
			classes: type.type,
		}

		if (type.type === "reference") {
			const keys = getKeys(schema)
			const index = keys.indexOf(type.value)
			if (index === -1) {
				element.classes = "reference error"
			} else {
				elements.push({
					group: "edges",
					data: {
						id: `${id}-0`,
						source: `l${index}`,
						target: id,
					},
					classes: "reference",
				})
			}
		} else if (type.type === "unit") {
			if (type === errorUnit) {
				element.classes = "unit error"
			}
		} else if (type.type === "uri") {
		} else if (type.type === "literal") {
		} else if (type.type === "product") {
			for (const [i, key] of getKeys(type.components).entries()) {
				const component = type.components[key]
				const target = makeTypeElement(
					schema,
					namespaces,
					elements,
					g,
					map,
					component
				)
				elements.push({
					group: "edges",
					data: {
						id: `${id}-${i}`,
						source: id,
						target,
						key: getURI(namespaces, key),
					},
					classes: "component",
				})
			}
		} else if (type.type === "coproduct") {
			for (const [i, key] of getKeys(type.options).entries()) {
				const option = type.options[key]
				const target = makeTypeElement(
					schema,
					namespaces,
					elements,
					g,
					map,
					option
				)
				elements.push({
					group: "edges",
					data: {
						id: `${id}-${i}`,
						source: id,
						target,
						key: getURI(namespaces, key),
					},
					classes: "option",
				})
			}
		} else {
			signalInvalidType(type)
		}

		elements.push(element)
		return id
	}
}

const xsdNamespace = "http://www.w3.org/2001/XMLSchema#"

function getTypeData(namespaces: Record<string, string>, type: APG.Type) {
	if (type.type === "literal") {
		const datatype = getURI(namespaces, type.datatype)
		const { width, height } = makeLiteralBackground(datatype)
		return { datatype, width, height }
	} else {
		return {}
	}
}

const rdfJSON = "http://www.w3.org/1999/02/22-rdf-syntax-ns#JSON"

function getURI(namespaces: Record<string, string>, uri: string) {
	if (uri.startsWith(xsdNamespace)) {
		return uri.slice(xsdNamespace.length)
	} else if (uri === rdfJSON) {
		return "JSON"
	}

	for (const [prefix, namespace] of Object.entries(namespaces)) {
		if (uri.startsWith(namespace)) {
			const value = uri.slice(namespace.length)
			return `${prefix}:${value}`
		}
	}

	return uri
}
