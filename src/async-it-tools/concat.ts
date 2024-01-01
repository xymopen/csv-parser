import { steal as itSteal, StolenError } from '../it-tools/concat'

const kIterators = Symbol('concat.iterators')

const steal = concatIt => {
	const iterators = concatIt[kIterators]
	concatIt[kIterators] = null
	return iterators
}

class AsyncConcatIterator<T> {
	[kIterators]: (AsyncIterator<T> | Iterator<T>)[][];

	constructor(iterators: (AsyncIterator<T> | Iterator<T>)[][]) {
		this[kIterators] = iterators
	}

	async next(...args: unknown[]) {
		if (this[kIterators] == null) {
			throw new StolenError()
		} else {
			const iterators = this[kIterators]

			while (true) {
				const it = iterators[0]
				const result = await it.next.apply(it, args)

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

function concat<T>(...iterables: (AsyncIterable<T> | Iterable<T>)[]) {
	const iterators: (AsyncIterator<T> | Iterator<T>)[] = Array.from((function* () {
		for (const iterable of iterables) {
			const it = iterable[Symbol.asyncIterator]?.() ?? iterable[Symbol.iterator]?.() ?? iterable
			const entries = itSteal(it) ?? steal(it)

			if (entries != null) {
				yield* entries
			} else {
				yield it
			}
		}
	})())

	return new AsyncConcatIterator(iterators)
}

export { concat as default, StolenError }
