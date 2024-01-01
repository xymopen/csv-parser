# csv-parser

A toy streamming CSV parser and stringifier.

**Note:** Due to the toy nature of this project, the type annotation may be inaccurate or incorrect.

## Usage

### Parse

```js
const input = fs.createReadStream('path/to/csv', 'utf8');

for await (const record of parseCsv(input.iterator(), true)) {
	console.log(record)
}
```

### Stringify

```js
const output = fs.createWriteStream('path/to/csv');

const data = [
	{
		year: '1997',
		make: 'Ford',
		model: 'E350',
		description: 'ac, abs, moon',
		price: '3000.00'
	},
	{
		year: '1999',
		make: 'Chevy',
		model: 'Venture "Extended Edition"',
		description: '',
		price: '4900.00'
	},
	{
		year: '1999',
		make: 'Chevy',
		model: 'Venture "Extended Edition, Very Large"',
		description: '',
		price: '5000.00'
	},
]

const keys = ['year', 'make', 'model', 'description', 'price']

for await (const chunk of stringifyCsv(data, keys)) {
	output.write(chunk)
}
```

**Note:** Buffering the output may speed up the process

```js
async function* buffered(it) {
	let buffer = ''

	for await (const chunk of it) {
		buffer += chunk

		if (buffer.length > 4096) {
			yield buffer
			buffer = ''
		}
	}

	yield buffer
	buffer = ''
}

for await (const chunk of buffered(stringifyCsv(data, keys))) {
	output.write(chunk)
}
```
