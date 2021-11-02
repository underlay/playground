import React, { useEffect, useRef } from "react"

import { keymap } from "@codemirror/view"
import { defaultKeymap } from "@codemirror/commands"
import { basicSetup } from "@codemirror/basic-setup"
import { classHighlightStyle } from "@codemirror/highlight"

import { taslxLanguage } from "codemirror-lang-taslx"

import { useCodeMirror } from "./codemirror.js"

const extensions = [
	basicSetup,
	classHighlightStyle,
	taslxLanguage,
	keymap.of(defaultKeymap),
]

interface EditorProps {
	initialValue: string
	onChange?: (value: string) => void
}

export function Editor({ initialValue, onChange }: EditorProps) {
	const [state, _, element] = useCodeMirror<HTMLDivElement>({
		doc: initialValue,
		extensions,
	})

	const valueRef = useRef<string>(initialValue)

	useEffect(() => {
		if (onChange !== undefined && state !== null) {
			const value = state.doc.toString()
			if (value !== valueRef.current) {
				valueRef.current = value
				onChange(value)
			}
		}
	}, [state])

	return <div className="editor" ref={element}></div>
}
