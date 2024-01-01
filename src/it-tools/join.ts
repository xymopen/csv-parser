const join = function* <T>(it: Iterator<T>, seperator: string) {
	{
		const head = it.next()

		if (head.done) {
			return
		} else {
			yield head.value
		}
	}

	while (true) {
		const result = it.next()

		if (result.done) {
			return
		} else {
			yield seperator
			yield result.value
		}
	}
}

export default join
