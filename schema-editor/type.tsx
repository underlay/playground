import React from "react"

import { useDebounce } from "use-debounce"

import { xsd } from "n3.ts"

import { APG, isReference } from "apg"

import { makeComponentId, ProductConfig } from "./product"
import { CoproductConfig, makeOptionId } from "./coproduct"
import { xsdDatatypes, LabelContext } from "./utils"

type Types = {
	label: APG.Reference
	unit: APG.Unit
	literal: APG.Literal
	iri: APG.Iri
	product: APG.Product
	coproduct: APG.Coproduct
}

const types: (keyof Types)[] = [
	"unit",
	"literal",
	"iri",
	"product",
	"coproduct",
	"label",
]

function getType(type: APG.Type): keyof Types {
	if (isReference(type)) {
		return "label"
	} else {
		return type.type
	}
}

export function SelectType(props: {
	children: React.ReactNode
	error: React.ReactNode
	namespace: null | string
	autoFocus: boolean
	propertyId: string
	valueId: string
	value: APG.Type
	// focus: string | null
	// onFocus: (id: string | null) => void
	onChange: (value: APG.Type) => void
}) {
	const handleTypeChange = React.useCallback(
		(
			{ target: { value } }: React.ChangeEvent<HTMLSelectElement>,
			labelMap: Map<string, string>
		) => {
			if (value === "unit") {
				props.onChange({ type: "unit" })
			} else if (value === "label") {
				const first = labelMap.keys().next()
				props.onChange({ id: first.value })
			} else if (value === "literal") {
				props.onChange({
					type: "literal",
					datatype: xsd.string,
				})
			} else if (value === "iri") {
				props.onChange({ type: "iri" })
			} else if (value === "product") {
				props.onChange({ type: "product", components: [] })
			} else if (value === "coproduct") {
				props.onChange({ type: "coproduct", options: [] })
			}
		},
		[props.onChange]
	)

	// const handleMouseOver = React.useCallback(
	// 	(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	// 		props.onFocus(props.propertyId)
	// 		event.stopPropagation()
	// 	},
	// 	[props.onFocus, props.propertyId]
	// )

	// const handleMouseOut = React.useCallback(
	// 	(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	// 		props.onFocus(null)
	// 		event.stopPropagation()
	// 	},
	// 	[props.onFocus]
	// )

	// const className = props.focus === props.propertyId ? "value focus" : "value"
	return (
		<LabelContext.Consumer>
			{(labelMap) => (
				<React.Fragment>
					<div
						className="value"
						// className={className}
						// onMouseOver={handleMouseOver}
						// onMouseOut={handleMouseOut}
					>
						<label className="type">
							<span>Type</span>
							<select
								value={getType(props.value)}
								onChange={(event) => handleTypeChange(event, labelMap)}
							>
								{types.map((t) => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
						</label>
						{props.children}
					</div>
					{props.error}
					<TypeConfig
						namespace={props.namespace}
						autoFocus={props.autoFocus}
						value={props.value}
						// focus={props.focus}
						id={props.valueId}
						onChange={props.onChange}
						// onFocus={props.onFocus}
					/>
				</React.Fragment>
			)}
		</LabelContext.Consumer>
	)
}

function TypeConfig(props: {
	namespace: null | string
	autoFocus: boolean
	// focus: string | null
	value: APG.Type
	id: string
	onChange: (value: APG.Type) => void
	// onFocus: (id: string | null) => void
}) {
	if (isReference(props.value)) {
		return (
			<ReferenceConfig
				namespace={props.namespace}
				autoFocus={props.autoFocus}
				id={props.value.id}
				parent={props.id}
				// focus={props.focus}
				onChange={props.onChange}
				// onFocus={props.onFocus}
			/>
		)
	} else if (props.value.type === "unit") {
		return null
	} else if (props.value.type === "literal") {
		return (
			<LiteralConfig
				datatype={props.value.datatype}
				parent={props.id}
				// focus={props.focus}
				onChange={props.onChange}
				// onFocus={props.onFocus}
			/>
		)
	} else if (props.value.type === "iri") {
		return null
	} else if (props.value.type === "product") {
		return (
			<ProductConfig
				namespace={props.namespace}
				autoFocus={props.autoFocus}
				components={makeComponentId(props.value.components)}
				parent={props.id}
				// focus={props.focus}
				// onFocus={props.onFocus}
				onChange={props.onChange}
			/>
		)
	} else if (props.value.type === "coproduct") {
		return (
			<CoproductConfig
				namespace={props.namespace}
				autoFocus={props.autoFocus}
				options={makeOptionId(props.value.options)}
				parent={props.id}
				// focus={props.focus}
				// onFocus={props.onFocus}
				onChange={props.onChange}
			/>
		)
	} else {
		return null
	}
}

function ReferenceConfig(props: {
	namespace: null | string
	autoFocus: boolean
	id: string
	parent: string
	// focus: string | null
	onChange: (value: APG.Reference) => void
	// onFocus: (focus: string | null) => void
}) {
	const handleChange = React.useCallback(
		({ target: { checked, value } }: React.ChangeEvent<HTMLInputElement>) => {
			if (checked) {
				props.onChange({ id: value })
			}
		},
		[props.onChange]
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

	// const handleLabelMouseOver = React.useCallback(
	// 	(event: React.MouseEvent<HTMLLabelElement, MouseEvent>, id: string) => {
	// 		props.onFocus(id)
	// 		event.stopPropagation()
	// 	},
	// 	[props.onFocus]
	// )

	// const handleLabelMouseOut = React.useCallback(
	// 	(event: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
	// 		props.onFocus(null)
	// 		event.stopPropagation()
	// 	},
	// 	[props.onFocus]
	// )

	// const className = props.focus === props.parent ? "focus" : ""
	return (
		<details className="reference" open={props.autoFocus}>
			<summary
			// className={className}
			// onMouseOver={handleMouseOver}
			// onMouseOut={handleMouseOut}
			>
				Reference
			</summary>
			<form>
				<LabelContext.Consumer>
					{(labelMap) =>
						Array.from(labelMap).map(([id, key]) => (
							<label
								key={id}
								// onMouseOver={(event) => handleLabelMouseOver(event, id)}
								// onMouseOut={handleLabelMouseOut}
							>
								<input
									type="radio"
									value={id}
									checked={props.id === id}
									onChange={handleChange}
								/>
								<code>{key}</code>
							</label>
						))
					}
				</LabelContext.Consumer>
			</form>
		</details>
	)
}

function LiteralConfig(props: {
	datatype: string
	parent: string
	// focus: string | null
	onChange: (value: APG.Literal) => void
	// onFocus: (focus: string | null) => void
}) {
	const [value, setValue] = React.useState<null | string>(null)

	const index = xsdDatatypes.indexOf(props.datatype)

	const handleSelect = React.useCallback(
		({ target }: React.ChangeEvent<HTMLSelectElement>) => {
			if (target.value === "") {
				props.onChange({ type: "literal", datatype: value || "" })
				if (value === null) {
					setValue("")
				}
			} else {
				const index = xsdDatatypes.indexOf(target.value)
				props.onChange({ type: "literal", datatype: xsdDatatypes[index] })
				if (value !== null) {
					setValue(null)
				}
			}
		},
		[props.onChange]
	)

	const handleChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setValue(value),
		[]
	)

	const [datatype] = useDebounce(value, 1000)
	const handleDatatypeChange = React.useCallback(
		(datatype: string) => {
			props.onChange({ type: "literal", datatype })
		},
		[props.onChange]
	)
	React.useEffect(() => {
		if (datatype !== null && datatype !== props.datatype) {
			handleDatatypeChange(datatype)
		}
	}, [datatype])

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

	// const className = props.focus === props.parent ? "literal focus" : "literal"
	return (
		<div
			className="literal"
			// className={className}
			// onMouseOver={handleMouseOver}
			// onMouseOut={handleMouseOut}
		>
			<label className="datatype">
				<span>Datatype</span>
				<select value={xsdDatatypes[index]} onChange={handleSelect}>
					{xsdDatatypes.map((xsdDatatype) => (
						<option key={xsdDatatype} value={xsdDatatype}>
							{xsdDatatype.slice(xsdDatatype.lastIndexOf("#") + 1)}
						</option>
					))}
					<option key="custom" value="">
						custom
					</option>
				</select>
				{index === -1 && value !== null && (
					<input
						className="uri"
						type="text"
						value={value}
						onChange={handleChange}
					/>
				)}
			</label>
		</div>
	)
}
