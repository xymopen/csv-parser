async function* flat(iterable) {
	for await (const value of iterable) {
		yield* value
	}
}

export default flat
