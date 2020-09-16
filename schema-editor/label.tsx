import React from "react"

import { useDebounce } from "use-debounce"

import { APG } from "apg"

import {
	uriPlaceholder,
	namePlaceholder,
	validateKey,
	propertyPatternURL,
	isDuplicate,
	LabelContext,
} from "./utils"
import { SelectType } from "./type"

export function LabelConfig(props: {
	namespace: null | string
	autoFocus: boolean
	index: number
	id: string
	keyName: string
	value: APG.Type
	onChange: (label: APG.Label) => void
	onRemove: (index: number) => void
}) {
	const autoFocus = React.useMemo(() => props.autoFocus, [])
	const handleChange = React.useCallback(
		(key: string, value: APG.Type) => {
			props.onChange({ type: "label", id: props.id, key, value })
		},
		[props.id, props.onChange]
	)

	const [key, setKey] = React.useState(props.keyName)
	const handleKeyChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setKey(value),
		[]
	)

	const handleValueChange = React.useCallback(
		(value: APG.Type) => handleChange(props.keyName, value),
		[props.id, props.onChange, props.keyName]
	)

	const [keyName] = useDebounce(key, 1000)
	React.useEffect(() => {
		if (keyName !== props.keyName) {
			handleChange(keyName, props.value)
		}
	}, [keyName])

	const handleClick = React.useCallback(({}) => props.onRemove(props.index), [
		props.onRemove,
		props.index,
	])

	const error = React.useMemo(() => {
		if (!validateKey(key, props.namespace)) {
			return (
				<div className="error">
					<span>Key must validate </span>
					<a href={propertyPatternURL}>this pattern</a>
				</div>
			)
		} else {
			return (
				<LabelContext.Consumer>
					{(labelMap) =>
						isDuplicate(props.id, key, labelMap) ? (
							<div className="error">
								<span>Duplicate key</span>
							</div>
						) : null
					}
				</LabelContext.Consumer>
			)
		}
	}, [key, props.id, props.namespace])

	// const handleMouseOver = React.useCallback(
	// 	(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	// 		props.onFocus(props.id)
	// 		event.stopPropagation()
	// 	},
	// 	[props.onFocus, props.id]
	// )

	// const handleMouseOut = React.useCallback(
	// 	(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	// 		props.onFocus(null)
	// 		event.stopPropagation()
	// 	},
	// 	[props.onFocus]
	// )

	return (
		<details className="label" open={autoFocus}>
			<summary
			// className={props.focus === props.id ? "focus" : ""}
			// onMouseOver={handleMouseOver}
			// onMouseOut={handleMouseOut}
			>
				<h2>{props.keyName}</h2>
			</summary>
			<SelectType
				namespace={props.namespace}
				autoFocus={autoFocus}
				value={props.value}
				propertyId={`${props.id}-def`}
				valueId={`${props.id}-val`}
				// focus={props.focus}
				error={error}
				onChange={handleValueChange}
				// onFocus={props.onFocus}
			>
				<label className="key">
					<span>Key</span>
					<input
						autoFocus={autoFocus}
						className="uri"
						type="text"
						value={key}
						placeholder={props.namespace ? namePlaceholder : uriPlaceholder}
						onChange={handleKeyChange}
					/>
				</label>
				<span className="remove">
					<button onClick={handleClick}>Remove label</button>
				</span>
			</SelectType>
		</details>
	)
}
