import { concat } from "../../async-it-tools"

const enum FieldStage {
	Start,
	Textdata,
	Escaped,
	Dquote,
}

async function field(it: AsyncIterator<string, void>, isForbidden: (str: string) => boolean) {
	let state = FieldStage.Start
	let string = ''

	while (true) {
		const result = await it.next()

		switch (state) {
			case FieldStage.Start: {
				if (result.done) {
					throw new SyntaxError(`Unexpect end of input`)
				} else if (isForbidden(result.value)) {
					return [concat([result.value][Symbol.iterator](), it), string]
				} if (result.value === "\"") {
					state = FieldStage.Escaped
				} else {
					state = FieldStage.Textdata
					string += result.value
				}
			}
				break
			case FieldStage.Textdata: {
				if (result.done || isForbidden(result.value)) {
					return [concat([result.value][Symbol.iterator](), it), string]
				} else if (result.value === '\"') {
					throw new SyntaxError(`Unexpect dquote in textdata`)
				} else {
					string += result.value
				}
			}
				break
			case FieldStage.Escaped: {
				if (result.done) {
					throw new SyntaxError(`Unexpect end of input`)
				} else if (result.value === "\"") {
					state = FieldStage.Dquote
				} else {
					string += result.value
				}
			}
				break
			case FieldStage.Dquote: {
				if (result.done) {
					return [it, string]
				} else if (result.value !== "\"") {
					return [concat([result.value][Symbol.iterator](), it), string]
				} else {
					string += "\""
					state = FieldStage.Escaped
				}
			}
				break
			default:
				throw new SyntaxError('Unexpected field stage')
		}
	}
}

export default field
