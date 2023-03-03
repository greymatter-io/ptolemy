const querystring = require('querystring')
const actions = require('../actions.js')

/**
 * Available slash commands.
 * Commands can process argument text passed in to the slash command
 * (/out <today|this week|next week>) if necessary.
 * They should return a string that corresponds to a key in actions.js
 */
const slashCommands = {
	out: argumentText => {
		console.log('argumentText', argumentText)

		let command

		if (['help', 'h'].includes(argumentText)) {
			command = 'outHelp'
		} else {
			command = 'out'
		}

		return command || 'help'
	}
}

exports.handler = async function(event, context, callback) {
	const responseCode = 200

	// Get the slashCommand from the second segment of the path
	// /ptolemy/out, &c.
	const slashCommand = event.path.replace('/ptolemy/', '')

	let argumentText
	if (event.body !== null && event.body !== undefined) {
		let body = querystring.parse(event.body)
		argumentText = body.text
	}

	const command = slashCommands[slashCommand](argumentText)

	var response = {
		statusCode: responseCode,
		body: await actions[command](argumentText)
	}
	callback(null, response)
}
