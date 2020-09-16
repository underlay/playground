import React from "react"
import { xsd } from "n3.ts"

import { APG, isReference } from "apg"

export function setArrayIndex<T>(array: T[], element: T, index: number): T[] {
	const result = [...array]
	result[index] = element
	return result
}

export const uriPlaceholder = "http://..."
export const namePlaceholder = "name or http://..."

const baseURL = "https://regexper.com/#"

export const namespacePattern = /^[a-z0-9]+:[a-zA-Z0-9_\-\/\.]+(?:#|\/)$/
export const namespacePatternURL =
	baseURL + encodeURIComponent(namespacePattern.source)

const propertyPattern = /^[a-z0-9]+:[a-zA-Z0-9_\-\/\.]+(?:#|\/)[a-zA-Z_\-\/\.]+$/
export const propertyPatternURL =
	baseURL + encodeURIComponent(propertyPattern.source)

const namePattern = /^[a-zA-Z0-9_\-\/\.]+$/
export const namePatternURL =
	baseURL + encodeURIComponent(propertyPattern.source)

export const validateKey = (input: string, namespace: null | string) =>
	propertyPattern.test(input) ||
	(namespace !== null &&
		namespacePattern.test(namespace) &&
		namePattern.test(input))

export function isDuplicate(
	id: string,
	key: string,
	labelMap: Map<string, string>
) {
	for (const [labelId, labelKey] of labelMap) {
		if (labelKey === key && labelId !== id) {
			return true
		}
	}
	return false
}

export function findError(
	type: APG.Type,
	namespace: null | string
): null | Error {
	if (isReference(type)) {
		return null
	} else if (type.type === "product") {
		const componentKeys: Set<string> = new Set()
		for (const component of type.components) {
			if (!validateKey(component.key, namespace)) {
				return new Error("Invalid product component key")
			} else if (componentKeys.has(component.key)) {
				return new Error("Duplicate product component key")
			} else {
				const error = findError(component.value, namespace)
				if (error !== null) {
					return error
				}
			}
		}
	}
	return null
}

function compactTypeWithNamespace(type: APG.Type, namespace: string) {
	if (isReference(type)) {
		return
	} else if (type.type === "product") {
		for (const component of type.components) {
			compactTypeWithNamespace(component.value, namespace)
			if (component.key.startsWith(namespace)) {
				component.key = component.key.slice(namespace.length)
			}
		}
	} else if (type.type === "coproduct") {
		for (const option of type.options) {
			compactTypeWithNamespace(option.value, namespace)
		}
	}
}

export function compactLabelWithNamespace(
	labels: APG.Label[],
	namespace: null | string
) {
	if (namespace === null) {
		return
	}
	for (const label of labels) {
		compactTypeWithNamespace(label.value, namespace)
		if (label.key.startsWith(namespace)) {
			label.key = label.key.slice(namespace.length)
		}
	}
}

export const xsdDatatypes: string[] = [
	xsd.string,
	xsd.integer,
	xsd.double,
	xsd.dateTime,
	xsd.boolean,
]

export const isImport: WeakSet<APG.Label[]> = new WeakSet()

export const FocusContext = React.createContext<{
	focus: null | string
	setFocus: (focus: null | string) => void
}>({ focus: null, setFocus: () => {} })

export const LabelContext = React.createContext<Map<string, string>>(new Map())

function cloneType(type: APG.Type): APG.Type {
	if (isReference(type)) {
		return { ...type }
	} else if (type.type === "product") {
		return {
			type: "product",
			components: type.components.map((component) => ({
				type: "component",
				key: component.key,
				value: cloneType(component.value),
			})),
		}
	} else if (type.type === "coproduct") {
		return {
			type: "coproduct",
			options: type.options.map((option) => ({
				type: "option",
				value: cloneType(option.value),
			})),
		}
	} else {
		return { ...type }
	}
}

export function cloneSchema(labels: APG.Label[]): APG.Label[] {
	return labels.map((label) => ({
		id: label.id,
		type: "label",
		key: label.key,
		value: cloneType(label.value),
	}))
}
