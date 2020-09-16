import React from "react"

import { APG } from "apg"

import { setArrayIndex } from "./utils"
import { SelectType } from "./type"

type OptionId = APG.Option & { id: string }

let optionId = 0

const hasOptionId = (option: APG.Option): option is OptionId =>
	option.hasOwnProperty("id")

export const makeOptionId = (options: APG.Option[]): OptionId[] => {
	for (const option of options) {
		if (!hasOptionId(option)) {
			const c = option as OptionId
			c.id = `_:o${optionId++}`
		}
	}
	return options as OptionId[]
}

export function CoproductConfig(props: {
	namespace: null | string
	autoFocus: boolean
	options: OptionId[]
	parent: string
	// focus: string | null
	// onFocus: (id: string | null) => void
	onChange: (type: APG.Coproduct) => void
}) {
	const handleChange = React.useCallback(
		(index: number, option: OptionId) =>
			props.onChange({
				type: "coproduct",
				options: setArrayIndex(props.options, option, index),
			}),
		[props.onChange, props.options]
	)

	const handleClick = React.useCallback(
		({}) =>
			props.onChange({
				type: "coproduct",
				options: [
					...props.options,
					{
						type: "option",
						id: `_:o${optionId++}`,
						value: { type: "unit" },
					},
				],
			}),
		[props.onChange, props.options]
	)

	const handleRemove = React.useCallback(
		(index: number) => {
			const options = props.options.slice()
			const [] = options.splice(index, 1)
			props.onChange({ type: "coproduct", options })
		},
		[props.onChange, props.options]
	)

	// const handleMouseOver = React.useCallback(
	// 	(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	// 		props.onFocus(props.parent)
	// 		event.stopPropagation()
	// 	},
	// 	[props.onFocus, props.parent]
	// )

	// const handleMouseOut = React.useCallback(
	// 	(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	// 		props.onFocus(null)
	// 		event.stopPropagation()
	// 	},
	// 	[props.onFocus]
	// )

	// const className =
	// 	props.focus === props.parent ? "coproduct header focus" : "coproduct header"
	return (
		<React.Fragment>
			<div
				className="coproduct header"
				// className={className}
				// onMouseOver={handleMouseOver}
				// onMouseOut={handleMouseOut}
			>
				<span>Options</span>
				<button className="add" onClick={handleClick}>
					Add option
				</button>
			</div>

			{props.options.map(({ id, value }, index) => (
				<OptionConfig
					key={id}
					id={id}
					value={value}
					index={index}
					namespace={props.namespace}
					autoFocus={props.autoFocus}
					// focus={props.focus}
					// onFocus={props.onFocus}
					onChange={handleChange}
					onRemove={handleRemove}
				/>
			))}
		</React.Fragment>
	)
}

function OptionConfig(props: {
	namespace: null | string
	autoFocus: boolean
	index: number
	id: string
	value: APG.Type
	// focus: string | null
	// onFocus: (id: string | null) => void
	onChange: (index: number, component: OptionId) => void
	onRemove: (index: number) => void
}) {
	const handleClick = React.useCallback(({}) => props.onRemove(props.index), [
		props.onRemove,
		props.index,
	])

	const handleTypeChange = React.useCallback(
		(value: APG.Type) => {
			props.onChange(props.index, {
				type: "option",
				id: props.id,
				value: value,
			})
		},
		[props.onChange]
	)

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

	// const className =
	// 	props.focus === props.id ? "coproduct entry focus" : "coproduct entry"
	return (
		<div
			className="coproduct entry"
			// className={className}
			// onMouseOver={handleMouseOver}
			// onMouseOut={handleMouseOut}
		>
			<SelectType
				// labelMap={props.labels}
				namespace={props.namespace}
				autoFocus={props.autoFocus}
				propertyId={props.id}
				valueId={`${props.id}-val`}
				value={props.value}
				error={null}
				// focus={props.focus}
				// onFocus={props.onFocus}
				onChange={handleTypeChange}
			>
				<span className="remove">
					<button onClick={handleClick}>Remove option</button>
				</span>
			</SelectType>
		</div>
	)
}
