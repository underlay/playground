import React from "react"
import ReactDOM from "react-dom"
import papaparse from "papaparse"
import { canonize, Quad } from "rdf-canonize"
import jsonld from "jsonld"
import { useDebounce } from "use-debounce"

import { APG } from "apg"

import "apg/context.jsonld"
const contextUrl = "lib/context.jsonld"
const contextFile = fetch(contextUrl).then((res) => res.json())

const main = document.querySelector("main")

const tabs = [".tsv", "text/tsv", "text/tab-separated-values"]
const commas = [".csv", "text/csv"]
const accept = tabs.concat(commas).join(",")

type ObjectResult = { [key: string]: string }
type ArrayResult = string[]
type Result =
	| papaparse.ParseResult<ObjectResult>
	| papaparse.ParseResult<ArrayResult>

function parse(text: string, headers: boolean): Result {
	const result = papaparse.parse(text, {
		header: headers,
		skipEmptyLines: "greedy",
	})
	return result as Result
}

const previewLines = 10
const namespacePattern = /^[a-z0-9]+:(?:\/[A-Za-z0-9-._:]*)*[A-Za-z0-9-._:]+(?:\/|#)$/
const namespacePatternURL =
	"https://regexper.com/#" + encodeURIComponent(namespacePattern.source)

const propertyPattern = /^[a-z0-9]+:(?:\/[A-Za-z0-9-._:]*)*[A-Za-z0-9-._:]+(?:\/|#)[A-Za-z0-9-._]+$/
const propertyPatternURL =
	"https://regexper.com/#" + encodeURIComponent(propertyPattern.source)

const initialSubjectUri = "http://example.com/foo"
function Index() {
	const [table, setTable] = React.useState(null as Result | null)
	const handleTableChange = React.useCallback(
		(table: Result | null) => setTable(table),
		[]
	)

	const [subjectUri, setSubjectUri] = React.useState(initialSubjectUri)

	const [focus, setFocus] = React.useState(NaN)
	const [uris, setUris] = React.useState(null as string[] | null)

	return (
		<React.Fragment>
			<Step1 focus={focus} onChange={handleTableChange} />
			{table !== null && table.errors.length === 0 && (
				<Step2 onChange={setSubjectUri} />
			)}
			{table !== null &&
				table.errors.length === 0 &&
				propertyPattern.test(subjectUri) && (
					<Step3 table={table} onFocus={setFocus} onChange={setUris}></Step3>
				)}
			{table !== null &&
				table.errors.length === 0 &&
				propertyPattern.test(subjectUri) &&
				uris !== null && (
					<Step4 subjectUri={subjectUri} table={table} uris={uris}></Step4>
				)}
		</React.Fragment>
	)
}

function Step1(props: {
	focus: number
	onChange: (result: Result | null) => void
}) {
	const input = React.useRef(null as HTMLInputElement | null)
	const [text, setText] = React.useState(null as string | null)
	const onFileChange = React.useCallback(
		async (_: React.ChangeEvent<HTMLInputElement>) => {
			if (input.current !== null && input.current.files !== null) {
				const file = input.current.files.item(0)
				if (file !== null) {
					file.text().then(setText)
				} else {
					setText(null)
				}
			}
		},
		[]
	)

	const [headers, setHeaders] = React.useState(true)
	const onIsHeaderChange = React.useCallback(
		({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) =>
			setHeaders(checked),
		[]
	)

	const result = React.useMemo(() => {
		return text === null ? null : parse(text, headers)
	}, [text, headers])

	React.useEffect(() => props.onChange(result), [result])

	return (
		<section className="file">
			<h2>Step 1: select the file</h2>
			<form>
				<label>
					<span>Drag and drop your CSV or TSV, or select a file:</span>
					<input
						ref={input}
						type="file"
						accept={accept}
						multiple={false}
						onChange={onFileChange}
					/>
				</label>
				<br />
				<label>
					<span>The first line is a header:</span>
					<input
						type="checkbox"
						checked={headers}
						onChange={onIsHeaderChange}
					></input>
				</label>
			</form>
			{result && (
				<React.Fragment>
					Preview:
					<Preview result={result} focus={props.focus} />
				</React.Fragment>
			)}
		</section>
	)
}

function Preview({ result, focus }: { result: Result; focus: number }) {
	if (result.errors.length > 0) {
		return (
			<div className="preview error">
				<dl>
					{result.errors.map((error, index) => (
						<React.Fragment key={index.toString()}>
							<dt>
								{error.type}: {error.code} in row {error.row}
							</dt>
							<dd>{error.message}</dd>
						</React.Fragment>
					))}
				</dl>
			</div>
		)
	} else if (Array.isArray(result.meta.fields)) {
		const data = result.data.slice(0, previewLines) as ObjectResult[]
		return (
			<div className="preview">
				<table>
					<tbody>
						<tr className="header">
							{result.meta.fields.map((field, j) => (
								<th key={field} className={j === focus ? "focus" : undefined}>
									{field}
								</th>
							))}
						</tr>
						{data.map((row, i) => (
							<tr key={i.toString()}>
								{result.meta.fields!.map((field, j) => (
									<td key={field} className={j === focus ? "focus" : undefined}>
										{row[field]}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	} else {
		const data = result.data.slice(0, previewLines) as ArrayResult[]
		return (
			<div className="preview">
				<table>
					<tbody>
						{data.map((row, i) => (
							<tr key={i.toString()}>
								{row.map((cell, j) => (
									<td
										key={j.toString()}
										className={j === focus ? "focus" : undefined}
									>
										{cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}
}

function Step2(props: { onChange: (value: string) => void }) {
	const [value, setValue] = React.useState(initialSubjectUri)

	const handleChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
			setValue(value)
			if (propertyPattern.test(value)) {
				props.onChange(value)
			}
		},
		[]
	)

	return (
		<section className="columns">
			<h2>Step 2: give the table with a URI type</h2>
			<label>
				This is the "type" or class of each row:{" "}
				<input
					type="text"
					placeholder="http://example.com/..."
					pattern={propertyPattern.source}
					onChange={handleChange}
					value={value}
				/>
			</label>
			{!propertyPattern.test(value) && (
				<div>
					<Validate />
				</div>
			)}
		</section>
	)
}

function Step3(props: {
	table: Result
	onFocus: (focus: number) => void
	onChange: (uris: string[] | null) => void
}) {
	const width = getWidth(props.table)
	const [uris, setUris] = React.useState<string[]>(() =>
		new Array(width).fill("")
	)
	const valid = React.useMemo(
		() => uris.map((uri) => propertyPattern.test(uri)),
		[uris]
	)

	React.useEffect(() => {
		if (valid.every((v) => v)) {
			props.onChange(uris)
		} else {
			props.onChange(null)
		}
	}, [uris, valid]) // should props be a dependency??

	const handleChange = (uri: string, index: number) => {
		const nextUris = [...uris]
		nextUris[index] = uri
		setUris(nextUris)
	}

	return (
		<section className="columns">
			<h2>Step 3: name the columns with URIs</h2>
			<Namespace table={props.table} onSubmit={setUris}></Namespace>
			<table>
				<tbody>{uris.map((uri, index) => {})}</tbody>
			</table>
		</section>
	)
}

function Property(props: {
	table: Result
	uri: string
	index: number
	onFocus: (index: number) => void
	onChange: (uri: string, index: number) => void
}) {
	const handleBlur = React.useCallback(({}) => props.onFocus(NaN), [
		props.onFocus,
	])

	const label = React.useMemo(() => getLabel(props.index, props.table), [
		props.index,
		props.table,
	])

	const [value, setValue] = React.useState<string>(props.uri)
	const handleChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
			setValue(value)
		},
		[]
	)

	const [uri] = useDebounce(value, 500)
	React.useEffect(() => {
		if (uri !== props.uri && propertyPattern.test(uri)) {
			props.onChange(uri, props.index)
		}
	}, [uri, props.uri, props.index])

	return (
		<tr>
			<td>{label}</td>
			<td>
				<input
					type="text"
					placeholder="http://example.com/..."
					pattern={propertyPattern.source}
					onFocus={({}) => props.onFocus(props.index)}
					onBlur={handleBlur}
					value={value}
					onChange={handleChange}
				></input>
				{!propertyPattern.test(value) && <Validate />}
			</td>
		</tr>
	)
}

function Validate({}) {
	const link = <a href={propertyPatternURL}>this</a>
	return (
		<span className="validate">
			(must be a valid URI matching {link} pattern)
		</span>
	)
}

function getWidth(table: Result): number {
	if (Array.isArray(table.meta.fields)) {
		return table.meta.fields.length
	} else {
		const data = table.data as ArrayResult[]
		return data.reduce((width, { length }) => Math.max(width, length), 0)
	}
}

function getLabel(index: number, table: Result) {
	if (Array.isArray(table.meta.fields)) {
		return <span>{table.meta.fields[index]}</span>
	} else {
		return null
	}
}

function Namespace(props: {
	table: Result
	onSubmit: (uris: string[]) => void
}) {
	const [namespace, setNamespace] = React.useState("http://example.com/")
	const onNamespaceChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setNamespace(value),
		[]
	)

	const handleClick = React.useCallback(
		({}: React.MouseEvent<HTMLButtonElement>) =>
			props.onSubmit(
				props.table.meta.fields!.map((field) => namespace + field)
			),
		[props.table, props.onSubmit, namespace]
	)

	if (Array.isArray(props.table.meta.fields)) {
		const disabled = !namespacePattern.test(namespace)
		return (
			<React.Fragment>
				<label style={{ display: "block" }}>
					<span>Auto-fill by appending the headers to this namespace:</span>
					<input
						className="namespace"
						type="text"
						value={namespace}
						onChange={onNamespaceChange}
						placeholder="http://example.com/"
						pattern={namespacePattern.source}
					></input>
					<button onClick={handleClick} disabled={disabled}>
						Go
					</button>
					<div>
						(must be a valid URI ending in / or #, matching{" "}
						<a href={namespacePatternURL}>this</a> pattern)
					</div>
				</label>
				<hr />
			</React.Fragment>
		)
	} else {
		return null
	}
}

async function makeSchema(subjectUri: string, uris: string[]): Promise<string> {
	const context = await contextFile
	const doc = {
		...context,
		"@graph": {
			type: "label",
			key: subjectUri,
			value: {
				type: "product",
				components: uris.map((uri) => ({
					type: "component",
					key: uri,
					value: { type: "literal", datatype: xsdString.value },
				})),
			},
		},
	}

	return jsonld.normalize(doc, { algorithm: "URDNA2015" })
}

function Step4(props: { subjectUri: string; table: Result; uris: string[] }) {
	const [dataObjectURL, setDataObjectURL] = React.useState<null | string>(null)
	const [schemaObjectURL, setSchemaObjectURL] = React.useState<null | string>(
		null
	)

	React.useEffect(() => {
		if (schemaObjectURL !== null) {
			setSchemaObjectURL(null)
		}
		if (dataObjectURL !== null) {
			setDataObjectURL(null)
		}
	}, [props.table, props.subjectUri, props.uris])

	const handleClick = React.useCallback(
		({}) => {
			const quads = Array.from(
				generateQuads(props.table, props.subjectUri, props.uris)
			)
			Promise.all([
				canonize(quads, { algorithm: "URDNA2015" }),
				makeSchema(props.subjectUri, props.uris),
			]).then(([data, schema]) => {
				setSchemaObjectURL(
					URL.createObjectURL(new Blob([schema], { type: "text/plain" }))
				)
				setDataObjectURL(
					URL.createObjectURL(new Blob([data], { type: "text/plain" }))
				)
			})
		},
		[props.table, props.subjectUri, props.uris]
	)

	const disabled = dataObjectURL !== null && schemaObjectURL !== null
	return (
		<section className="download">
			<h2>Step 4: download the files</h2>
			<div>
				<button disabled={disabled} onClick={handleClick}>
					Generate files
				</button>
			</div>
			<div>
				{disabled ? (
					<ul>
						<li>
							<a href={schemaObjectURL!}>schema.nq</a>
						</li>
						<li>
							<a href={dataObjectURL!}>assertion.nq</a>
						</li>
					</ul>
				) : null}
			</div>
		</section>
	)
}

const defaultGraph = { termType: "DefaultGraph", value: "" }
const rdfType = {
	termType: "NamedNode",
	value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
}
const xsdString = {
	termType: "NamedNode",
	value: "http://www.w3.org/2001/XMLSchema#string",
}

function* generateQuads(
	table: Result,
	subjectUri: string,
	uris: string[]
): Generator<Quad, void, undefined> {
	const classTerm = { termType: "NamedNode", value: subjectUri }
	const propertyTerms = uris.map((value) => ({ termType: "NamedNode", value }))
	for (const [i, row] of table.data.entries()) {
		const entity = { termType: "BlankNode", value: `s-${i}` }
		yield {
			subject: entity,
			predicate: rdfType,
			object: classTerm,
			graph: defaultGraph,
		}
		for (const j of uris.keys()) {
			const value = Array.isArray(row) ? row[j] : row[table.meta.fields![j]]
			const term = {
				termType: "Literal",
				value: value || "",
				datatype: xsdString,
			}
			yield {
				subject: entity,
				predicate: propertyTerms[j],
				object: term,
				graph: defaultGraph,
			}
		}
	}
}

ReactDOM.render(<Index />, main)
