// Load varaiables from the .env file into process.env
require('dotenv').config()

const { WebClient } = require('@slack/client')
const actions = require('../actions.js')
const availableChannels = require('../channels.js')

const TOKEN = process.env.BOT_USER_OAUTH_TOKEN

exports.handler = async function(
	{ command, args, channels = [], say },
	context,
	callback
) {
	console.log('Command:', command)
	console.log('Channels:', channels)

	// Accept a space-separated string of multiple channels
	if (typeof channels === 'string') {
		channels = channels.split(';')
	}

	if (!channels.length) {
		channels.push(availableChannels.default)
	} else {
		channels = channels.map(channel => {
			if (!availableChannels[channel]) {
				// If the channel string isn't in available channels, just try slapping a
				// hash on the front of it
				return `#${channel}`
			} else {
				return availableChannels[channel]
			}
		})
	}

	if (!command && !say) {
		console.log('Please specify a command.')
	} else if (Object.keys(actions).indexOf(command) === -1 && !say) {
		console.log(`Command \`${command}\` not found.`)
	} else {
		const web = new WebClient(TOKEN)

		const text = say || (await actions[command](args))

		channels.forEach(channel => {
			let message = text

			console.log('channel, message', channel, message)

			web.chat.postMessage({
				channel,
				blocks: JSON.stringify(JSON.parse(message).blocks)
			})
		})

		callback(null)
	}
}
