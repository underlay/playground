import React from "react"

import { useDebounce } from "use-debounce"
import {
	DebounceDelay,
	handleCmdBackspace,
	Meta,
	propertyPatternURL,
	validateKey,
} from "./utils"

export default function ComponentEditor(props: {
	ele: cytoscape.CollectionReturnValue
	namespace: null | string
}) {
	const siblings = React.useMemo(
		() =>
			new Set(
				props.ele
					.source()
					.outgoers("edge.component")
					.difference(props.ele)
					.map((sibling) => sibling.data("key"))
			),
		[props.ele]
	)
	const k: string = props.ele.data("key")
	const [value, setValue] = React.useState(k)
	const handleChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setValue(value),
		[]
	)

	const setKey = React.useCallback(
		(key: string) => {
			if (key !== props.ele.data("key")) {
				props.ele.data({ key })
			}
		},
		[props.ele]
	)

	const [key] = useDebounce(value, DebounceDelay)
	React.useEffect(() => setKey(key), [key])

	const errors = React.useMemo(() => {
		const errors: JSX.Element[] = []
		if (!validateKey(value, props.namespace)) {
			errors.push(
				<div key="validate" className="error">
					<span>Key must validate </span>
					<a href={propertyPatternURL}>this pattern</a>
				</div>
			)
		}
		if (siblings.has(value)) {
			errors.push(
				<div key="duplicate" className="error">
					<span>Duplicate key</span>
				</div>
			)
		}
		return errors
	}, [value, siblings, props.namespace])

	return (
		<React.Fragment>
			<div className="type component">
				<h2>Component</h2>
				<form>
					<label>
						<span>Key</span>
						<input
							type="text"
							value={value}
							onChange={handleChange}
							onKeyDown={handleCmdBackspace}
						/>
					</label>
				</form>
				<p>{Meta}-Click on a different node to change the component value</p>
				<p>{Meta}-Backspace to delete</p>
			</div>
			{errors}
		</React.Fragment>
	)
}
