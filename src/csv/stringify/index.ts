import { join } from '../../it-tools'
import stringifyField from './field'

const toString = (value: unknown): string => value == null ? '' : String(value)

const iterFields = function* (record: Iterable<Iterable<any>>): Generator<string, void> {
	for (const field of record) {
		yield stringifyField(toString(field), RegExp.prototype.test.bind(/[,\r\n]/))
	}
}

const iterWithHeader = async function* <T>(records: AsyncIterable<T>, header: (keyof T)[]): AsyncGenerator<Iterable<any>> {
	for await (const record of records) {
		yield header.map(key => record[key])
	}
}

interface Stringify {
	<T>(records: AsyncIterable<T>, header: (keyof T)[]): AsyncGenerator<string, void>
	(records: AsyncIterable<Iterable<any>>, header?: undefined): AsyncGenerator<string, void>
}

const stringify = async function* <T>(records: AsyncIterable<T>, header: (keyof T)[] | undefined) {
	if (Array.isArray(header)) {
		yield* join(iterFields(header), ',')
		yield '\r\n'
		records = iterWithHeader(records, header)
	}

	for await (const record of records) {
		yield* join(iterFields(record), ',')
		yield '\r\n'
	}
} as Stringify

export default stringify
