import React from "react"

import { useDebounce } from "use-debounce"

import { APG } from "apg"

import {
	setArrayIndex,
	uriPlaceholder,
	validateKey,
	propertyPatternURL,
	namePlaceholder,
	isDuplicate,
	LabelContext,
} from "./utils"
import { SelectType } from "./type"

type ComponentId = APG.Component & { id: string }

let componentId = 0

const hasComponentId = (component: APG.Component): component is ComponentId =>
	component.hasOwnProperty("id")

export const makeComponentId = (components: APG.Component[]): ComponentId[] => {
	for (const component of components) {
		if (!hasComponentId(component)) {
			const c = component as ComponentId
			c.id = `_:c${componentId++}`
		}
	}
	return components as ComponentId[]
}

export function ProductConfig(props: {
	// labels: Map<string, string>
	namespace: null | string
	autoFocus: boolean
	components: ComponentId[]
	parent: string
	// focus: string | null
	// onFocus: (id: string | null) => void
	onChange: (type: APG.Product) => void
}) {
	const handleChange = React.useCallback(
		(index: number, component: ComponentId) => {
			const components = setArrayIndex(props.components, component, index)
			props.onChange({ type: "product", components })
		},
		[props.onChange, props.components]
	)

	const handleClick = React.useCallback(
		({}) => {
			const component: ComponentId = {
				type: "component",
				id: `_:c${componentId++}`,
				key: "",
				value: { type: "unit" },
			}
			const components: APG.Component[] = [...props.components, component]
			props.onChange({
				type: "product",
				components,
			})
		},
		[props.onChange, props.components]
	)

	const handleRemove = React.useCallback(
		(index: number) => {
			const components = props.components.slice()
			const [] = components.splice(index, 1)
			props.onChange({ type: "product", components })
		},
		[props.onChange, props.components]
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
	// 	props.focus === props.parent ? "product header focus" : "product header"
	return (
		<React.Fragment>
			<div
				className="product header"
				// className={className}
				// onMouseOver={handleMouseOver}
				// onMouseOut={handleMouseOut}
			>
				<span>Components</span>
				<button className="add" onClick={handleClick}>
					Add component
				</button>
			</div>

			{props.components.map(({ id, key, value }, index) => (
				<ComponentConfig
					key={id}
					id={id}
					keyName={key}
					value={value}
					index={index}
					// labels={props.labels}
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

function ComponentConfig(props: {
	namespace: null | string
	autoFocus: boolean
	index: number
	id: string
	keyName: string
	value: APG.Type
	// focus: string | null
	// onFocus: (id: string | null) => void
	onChange: (index: number, component: ComponentId) => void
	onRemove: (index: number) => void
}) {
	const [key, setKey] = React.useState(props.keyName)
	const handleChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setKey(value),
		[]
	)

	const [keyName] = useDebounce(key, 1000)
	React.useEffect(() => {
		if (keyName !== props.keyName) {
			props.onChange(props.index, {
				type: "component",
				id: props.id,
				key: keyName,
				value: props.value,
			})
		}
	}, [keyName, props.index, props.id, props.value, props.onChange])

	const handleClick = React.useCallback(({}) => props.onRemove(props.index), [
		props.onRemove,
		props.index,
	])

	const handleTypeChange = React.useCallback(
		(value: APG.Type) => {
			props.onChange(props.index, {
				type: "component",
				id: props.id,
				key: props.keyName,
				value: value,
			})
		},
		[props.onChange]
	)

	const error = React.useMemo(() => {
		if (!validateKey(key, props.namespace)) {
			return (
				<div className="error">
					<span>Key must validate </span>
					<a href={propertyPatternURL}>this pattern</a>
				</div>
			)
		}

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

	// const className =
	// 	props.focus === props.id ? "product entry focus" : "product entry"

	return (
		<div
			className="product entry"
			// className={className}
			// onMouseOver={handleMouseOver}
			// onMouseOut={handleMouseOut}
		>
			<SelectType
				namespace={props.namespace}
				autoFocus={props.autoFocus}
				propertyId={props.id}
				valueId={`${props.id}-val`}
				value={props.value}
				// focus={props.focus}
				onChange={handleTypeChange}
				// onFocus={props.onFocus}
				error={error}
			>
				<label className="key">
					<span>Key</span>
					<input
						autoFocus={props.autoFocus}
						className="uri"
						type="text"
						value={key}
						onChange={handleChange}
						placeholder={props.namespace ? namePlaceholder : uriPlaceholder}
					/>
				</label>
				<span className="remove">
					<button onClick={handleClick}>Remove component</button>
				</span>
			</SelectType>
		</div>
	)
}
