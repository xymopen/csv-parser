const stringifyEscaped = (str: string): string =>
	`"${str.replace(/"/g, "\"\"")}"`

const stringifyNonEscaped = (str: string): string =>
	str

const stringifyField = (str: string, hasForbidden: (str: string) => boolean): string =>
	str.includes("\"") || hasForbidden(str) ? stringifyEscaped(str) : stringifyNonEscaped(str)

export default stringifyField
