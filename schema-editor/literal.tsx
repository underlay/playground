import React from "react"
import { useDebounce } from "use-debounce"

import {
	DebounceDelay,
	handleCmdBackspace,
	propertyPatternURL,
	validateKey,
	makeLiteralBackground,
	xsdDatatypes,
} from "./utils"

export default function LiteralEditor(props: {
	ele: cytoscape.CollectionReturnValue
}) {
	const d: string = props.ele.data("datatype")
	const [index, setIndex] = React.useState(xsdDatatypes.indexOf(d))
	const [value, setValue] = React.useState(index === -1 ? d : null)

	const setDatatype = React.useCallback(
		(datatype: string) => {
			if (datatype !== props.ele.data("datatype")) {
				const data = makeLiteralBackground(datatype)
				props.ele.data({ datatype, ...data })
				setIndex(xsdDatatypes.indexOf(datatype))
			}
		},
		[props.ele]
	)

	const handleSelect = React.useCallback(
		({ target }: React.ChangeEvent<HTMLSelectElement>) => {
			setDatatype(target.value)
			if (target.value === "" && value === null) {
				setValue("")
			} else if (target.value !== "" && value !== null) {
				setValue(null)
			}
		},
		[value]
	)

	const handleChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setValue(value),
		[]
	)

	const [datatype] = useDebounce(value, DebounceDelay)
	React.useEffect(() => {
		if (datatype !== null) {
			setDatatype(datatype)
		}
	}, [datatype])

	const error = React.useMemo(() => {
		if (value === null || validateKey(value, null)) {
			return null
		} else {
			return (
				<div key="validate" className="error">
					<span>Datatype must validate </span>
					<a href={propertyPatternURL}>this pattern</a>
				</div>
			)
		}
	}, [value])

	return (
		<React.Fragment>
			<div className="type literal">
				<h2>Literal</h2>
				<form>
					<label className="datatype">
						<span>Datatype</span>
						<select value={index === -1 ? "" : d} onChange={handleSelect}>
							{xsdDatatypes.map((datatype) => (
								<option key={datatype} value={datatype}>
									{datatype.slice(datatype.lastIndexOf("#") + 1)}
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
								onKeyDown={handleCmdBackspace}
							/>
						)}
					</label>
				</form>
				<p>Cmd-Backspace to delete</p>
			</div>
			{error}
		</React.Fragment>
	)
}
