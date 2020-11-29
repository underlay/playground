import React, { memo, useEffect } from "react"

import cytoscape from "cytoscape"

import { Style, DagreLayout } from "./style"
import { APG } from "@underlay/apg"
import { makeElements } from "./elements"

const cyOptions: cytoscape.CytoscapeOptions = {
	style: Style,
	zoom: 1,
	maxZoom: 2,
	minZoom: 0.5,
	boxSelectionEnabled: false,
	userPanningEnabled: false,
	userZoomingEnabled: false,
	autoungrabify: true,
	autounselectify: true,
}

export interface GraphProps {
	schema: APG.Schema
	namespaces: Record<string, string>
}

export const Graph = memo(({ schema, namespaces }: GraphProps) => {
	// const [focus, setFocus] = React.useState<null | string>(null)

	const focusRef = React.useRef<cytoscape.CollectionReturnValue | null>(null)
	const div = React.useRef<HTMLDivElement | null>(null)
	const ref = React.useRef<cytoscape.Core | null>(null)

	const handleSelect = React.useCallback(
		(target: cytoscape.CollectionReturnValue) => {
			focusRef.current = target
			// setFocus(target.id())
		},
		[]
	)

	const handleUnselect = React.useCallback(
		(target: cytoscape.CollectionReturnValue) => {
			if (focusRef.current !== null && focusRef.current.id() === target.id()) {
				focusRef.current = null
				// setFocus(null)
			}
		},
		[]
	)

	useEffect(() => {
		if (div.current !== null) {
			ref.current = cytoscape({ container: div.current, ...cyOptions })
			ref.current.on("select", ({ target }) => handleSelect(target))
			ref.current.on("unselect", ({ target }) => handleUnselect(target))
			;(window as any).cy = ref.current
		}
	}, [])

	useEffect(() => {
		const cy = ref.current
		if (cy !== null) {
			cy.batch(() => {
				cy.elements().remove()
				const elements = makeElements(schema, namespaces)
				cy.add(elements).layout(DagreLayout).run()
			})
		}
	}, [schema, namespaces])

	return <div className="graph" ref={div}></div>
})
