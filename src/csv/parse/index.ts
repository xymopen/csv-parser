import { concat, flat } from "../../async-it-tools"
import parseField from './field'

const parseRecord = async function* (it): AsyncGenerator<string[], void> {
	while (true) {
		const fields = []

		while (true) {
			const result = await it.next()

			if (result.done) {
				return
			} else {
				let field

				([it, field] = await parseField(concat([result.value][Symbol.iterator](), it), RegExp.prototype.test.bind(/^[,\r\n]$/)));

				{
					const result = await it.next()

					if (result.done) {
						return
					} else if (result.value === ',') {
						fields.push(field)
						continue
					} else if (result.value === '\r') {
						const result = await it.next()

						if (result.done || result.value !== '\n') {
							throw new SyntaxError(`Unexpected \`${result.value}' after CR`)
						} else {
							fields.push(field)
							yield fields
							break
						}
					}
				}
			}
		}
	}
}

interface Parse {
	<K extends PropertyKey>(it: AsyncIterator<string>, hasHeader: true): AsyncGenerator<string, void>
	(it: AsyncIterator<string>, hasHeader?: false): AsyncGenerator<string, void>
}

const parse = async function* (it, hasHeader) {
	let header: PropertyKey[] | null = null

	it = parseRecord(flat(it))

	{
		const result = await it.next()

		if (result.done) {
			return
		} else if (hasHeader) {
			header = result.value
		} else {
			yield result.value
		}
	}

	while (true) {
		const result = await it.next()

		if (result.done) {
			break
		} else {
			if (header != null) {
				yield Object.fromEntries(header.map((name, i) => [name, result.value[i]]))
			} else {
				yield result.value
			}
		}
	}
} as Parse

export default parse
