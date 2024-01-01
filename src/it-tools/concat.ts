const kIterators = Symbol('concat.asyncIterators')

const steal = concatIt => {
	const iterators = concatIt[kIterators]
	concatIt[kIterators] = null
	return iterators
}

class StolenError extends Error {
	constructor() {
		super('Concat Iterator has been stolen.')
	}
}

class ConcatIterator<T> {
	[kIterators]: Iterator<T>[];

	constructor(iterators: Iterator<T>[]) {
		this[kIterators] = iterators
	}

	next(...args: unknown[]) {
		if (this[kIterators] == null) {
			throw new StolenError()
		} else {
			const iterators = this[kIterators]

			while (true) {
				const it = iterators[0]
				const result = it.next.apply(it, args)

				if (iterators.length <= 1 || !result.done) {
					return result
				} else {
					iterators.shift()
					continue
				}
			}
		}
	}
}

function concat<T>(...iterables: Iterable<T>[]) {
	const iterators: Iterator<T>[] = Array.from((function* () {
		for (const iterable of iterables) {
			const it = iterable[Symbol.iterator]?.() ?? iterable
			const entries = steal(it)

			if (entries != null) {
				yield* entries
			} else {
				yield it
			}
		}
	})())

	return new ConcatIterator(iterators)
}

export { concat as default, steal, StolenError }
