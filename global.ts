import papaparse from "papaparse"
import canonize from "rdf-canonize"

declare global {
	const React: typeof React
	const ReactDOM: typeof ReactDOM
	const Papa: typeof papaparse
	const RdfCanonize: typeof canonize
}
