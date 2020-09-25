import { xsd } from "n3.ts"

import { APG } from "apg"

let idCounter = 0
export const getId = () => `b${idCounter++}`

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

export function makeLabelBackground(key: string) {
	const width = Math.max(CHAR * key.length + 12, 20),
		height = LINE_HEIGHT

	return makeBackground(
		`<g><text x="6" y="14">${key}</text></g>`,
		width,
		height
	)
}

export function makeLiteralBackground(datatype: string) {
	const name = xsdDatatypes.includes(datatype)
		? `[${datatype.slice(datatype.lastIndexOf("#") + 1)}]`
		: `<${datatype}>`

	const width = CHAR * name.length + 8,
		height = LINE_HEIGHT

	const text = name.replace(/</g, "&lt;").replace(/>/g, "&gt;")
	return makeBackground(
		`<g><text x="4" y="13">${text}</text></g>`,
		width,
		height
	)
}

export function handleCmdBackspace(
	event: React.KeyboardEvent<HTMLInputElement>
) {
	if (event.key === "Backspace" && event.metaKey) {
		event.stopPropagation()
	}
}

export const DebounceDelay = 200

export const isMeta =
	window.navigator.platform === "MacIntel"
		? (event: KeyboardEvent | MouseEvent) => event.metaKey
		: (event: KeyboardEvent | MouseEvent) => event.ctrlKey

export const Meta = window.navigator.platform === "MacIntel" ? "Cmd" : "Ctrl"

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

export function compactTypeWithNamespace(
	type: APG.Type,
	namespace: null | string
) {
	if (type.id.startsWith("_:")) {
		type.id = type.id.slice(2)
	}
	if (type.type === "label") {
		if (namespace !== null && type.key.startsWith(namespace)) {
			type.key = type.key.slice(namespace.length)
		}
		if (type.value.startsWith("_:")) {
			type.value = type.value.slice(2)
		}
	} else if (type.type === "product") {
		for (const component of type.components) {
			if (component.id.startsWith("_:")) {
				component.id = component.id.slice(2)
			}
			if (namespace !== null && component.key.startsWith(namespace)) {
				component.key = component.key.slice(namespace.length)
			}
			if (component.value.startsWith("_:")) {
				component.value = component.value.slice(2)
			}
		}
	} else if (type.type === "coproduct") {
		for (const option of type.options) {
			if (option.value.startsWith("_:")) {
				option.value = option.value.slice(2)
			}
		}
	} else if (type.type === "literal") {
		if (namespace !== null && type.datatype.startsWith(namespace)) {
			type.datatype = type.datatype.slice(namespace.length)
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

export function cloneType(type: APG.Type): APG.Type {
	if (type.type === "product") {
		return {
			id: type.id,
			type: "product",
			components: type.components.map((component) => ({ ...component })),
		}
	} else if (type.type === "coproduct") {
		return {
			id: type.id,
			type: "coproduct",
			options: type.options.map((option) => ({ ...option })),
		}
	} else {
		return { ...type }
	}
}
