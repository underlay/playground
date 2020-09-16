import React from "react"

import { useDebounce } from "use-debounce"

import { uriPlaceholder, namespacePattern, namespacePatternURL } from "./utils"

export function Namespace(props: {
	namespace: null | string
	onChange: (namespace: null | string) => void
}) {
	const [value, setValue] = React.useState<null | string>(props.namespace)

	const handleUseNamespaceChange = React.useCallback(
		({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) =>
			props.onChange(checked ? "" : null),
		[props.onChange]
	)

	const handleNamespaceChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setValue(value),
		[]
	)

	const [namespace] = useDebounce(value, 1000)
	const updateNamespace = React.useCallback(
		(namespace: null | string) => {
			if (namespace !== props.namespace) {
				props.onChange(namespace)
			}
		},
		[props.namespace, props.onChange]
	)

	React.useEffect(() => updateNamespace(namespace), [namespace])
	React.useEffect(() => setValue(props.namespace), [props.namespace])

	return (
		<React.Fragment>
			<div className="namespace">
				<label>
					<span>Namespace</span>
					<input
						type="checkbox"
						checked={value !== null}
						onChange={handleUseNamespaceChange}
					/>
				</label>
				{value !== null && (
					<input
						className="uri"
						type="text"
						value={value}
						placeholder={uriPlaceholder}
						onChange={handleNamespaceChange}
					/>
				)}
			</div>
			{value !== null && !namespacePattern.test(value) && (
				<div className="error">
					<span>Namespace value must match </span>
					<a href={namespacePatternURL}>this pattern</a>
				</div>
			)}
		</React.Fragment>
	)
}
