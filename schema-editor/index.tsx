import React, { useCallback, useState } from "react"
import ReactDOM from "react-dom"

import { Editor, UpdateProps } from "@underlay/apg-schema-codemirror"

import { initialValue } from "./initial"

import { Graph } from "./graph"
import { APG } from "@underlay/apg"

function Index({}) {
	const [schema, setSchema] = useState<APG.Schema | null>(null)
	const [namespaces, setNamespaces] = useState<Record<string, string> | null>(
		null
	)

	const handleChange = useCallback(({ schema, namespaces }: UpdateProps) => {
		setSchema(schema)
		setNamespaces(namespaces)
	}, [])

	return (
		<React.Fragment>
			<Editor initialValue={initialValue} onChange={handleChange} />
			{schema !== null && namespaces !== null && (
				<Graph schema={schema} namespaces={namespaces} />
			)}
		</React.Fragment>
	)
}

const main = document.querySelector("main")
ReactDOM.render(<Index />, main)
