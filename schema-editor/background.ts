export function makeLabelBackground(key: string) {
	const width = 11.1 * key.length + 30
	const height = 30
	return { width, height }
}

export function makeLiteralBackground(datatype: string) {
	const width = 7.4 * datatype.length + 20
	const height = 20
	return { width, height }
}
