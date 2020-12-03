import React, { useCallback, useMemo, useState } from "react"
import ReactDOM from "react-dom"
import { useDebounce } from "use-debounce"

import { APG } from "@underlay/apg"

import * as t from "io-ts"

import { TomlSchema, Datatype, Property } from "./codec"

import Graph from "./graph"
import { parseToml } from "./parse"

const initialValue = `# Welcome to the schema editor!
# If you're new, you probably want to read
# the schema language documentation here:
# http://r1.underlay.org/docs/schemas

# If you want to just get started right away,
# here's a generic template to work with:

namespace = "http://example.com/"

[classes.Recipe]
name = "string"
wasDerivedFromURL = "string"
[classes.Recipe.hasAuthor]
kind = "reference"
label = "Author"
cardinality = "optional"
[classes.Recipe.hasSource]
kind = "reference"
label = "Webpage"
cardinality = "optional"
[classes.Recipe.hasIngredient]
kind = "reference"
label = "Ingredient"
cardinality = "any"
[classes.Recipe.hasAssociatedTags]
kind = "reference"
label = "Tag"
cardinality = "any"

[classes.Ingredient]
name = "string"
url = "string"

[classes.Webpage]
url = "string"

[classes.Author]
name = "string"

[classes.Tag]
name = "string"
`

function Index({}) {
	const [value, setValue] = useState(initialValue)

	const handleChange = useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => [
			setValue(value),
		],
		[]
	)

	const [toml] = useDebounce(value, 500)
	const schema = useMemo(() => parseToml(toml), [toml])

	return (
		<React.Fragment>
			<textarea value={value} onChange={handleChange}></textarea>
			{schema._tag === "Right" && <Graph schema={schema.right} />}
		</React.Fragment>
	)
}

const main = document.querySelector("main")
ReactDOM.render(<Index />, main)
