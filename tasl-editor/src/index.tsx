import React from "react"
import ReactDOM from "react-dom"

import { Editor } from "./editor.js"
import { initialValue } from "./initialValue.js"

function Index({}) {
	return (
		<>
			<h1>
				<a href="../index.html">playground</a>
				<span> / </span>
				<span>tasl editor</span>
			</h1>
			<Editor initialValue={initialValue} />
		</>
	)
}

ReactDOM.render(<Index />, document.querySelector("main"))
