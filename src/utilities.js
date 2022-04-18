const moment = require('moment-timezone')

const TZ = 'America/New_York'

function now() {
	return moment().tz(TZ)
}

// Take an array of strings with colons in them (:) and format them
// with spaces padding the keys on the left so that the colons line up
function tableFormat(arr) {
	arr = arr.map(str => str.split(':'))

	const longestKey = arr.reduce((a, b) => {
		return a[0].length > b[0].length ? a : b
	})[0].length

	arr = arr.map(line => {
		const key = line[0]
		const value = line[1]
		return [strN(' ', longestKey - key.length) + key, value].join(':')
	})

	return arr.join('\n')
}

// Return a string of an arbitrary character with a specified length
// Ex: strN('-', 5) -> '-----'
function strN(char, num, str = '') {
	return num === 0 ? str : strN(char, num - 1, str + char)
}

function section(text = '') {
	return {
		type: 'section',
		text: {
			type: 'mrkdwn',
			text
		}
	}
}

module.exports = { now, tableFormat, strN, section, TZ }
