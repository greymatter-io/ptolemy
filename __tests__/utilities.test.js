const { tableFormat, strN } = require('../src/utilities.js')

describe('strN', () => {
	test('correctly creates a desired string', () => {
		expect(strN('-', 5)).toEqual('-----')
	})
})

describe('tableFormat', () => {
	test('correctly formats an array of strings with colons', () => {
		const arr = [
			'Nate: a little weird',
			'Elliot: master of personal anecdotes',
			'Michelle: best-organized dev ever',
			'Foo: bar'
		]

		const expectedOutput = [
			'    Nate: a little weird',
			'  Elliot: master of personal anecdotes',
			'Michelle: best-organized dev ever',
			'     Foo: bar'
		].join('\n')

		expect(tableFormat(arr)).toEqual(expectedOutput)
	})
})
