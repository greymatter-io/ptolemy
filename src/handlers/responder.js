// Load varaiables from the .env file into process.env
require('dotenv').config()

const { WebClient } = require('@slack/client')

// When you connect to rtm.connect or use Web API methods on behalf of your bot
// user, you should use this bot user access token instead of the top-level
// access token granted to your application.
// @see https://api.slack.com/docs/oauth#bots
const BOT_USER_OAUTH_TOKEN = process.env.BOT_USER_OAUTH_TOKEN

const events = {
	im: event => {
		const { channel, text } = event
		console.log('channel', channel)

		const response = `Hey! I heard you say "${text}", but I haven't been trained to say anything, yet.`
		const web = new WebClient(BOT_USER_OAUTH_TOKEN)
		web.chat.postMessage({
			channel,
			text: response
		})
	}
}

exports.handler = async function(event, context, callback) {
	const body = JSON.parse(event.body)

	const { channel_type, subtype } = body.event

	// Respond as quickly as possible with a success code
	// @see https://api.slack.com/events-api#responding_to_events
	callback(null, { statusCode: 200 })

	// Now, we can take an action based on the request
	if (channel_type === 'im' && subtype !== 'bot_message') {
		events.im(body.event)
	}
}
