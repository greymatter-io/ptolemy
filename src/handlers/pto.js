// Load varaiables from the .env file into process.env
require('dotenv').config()

const querystring = require('querystring')
const { WebClient } = require('@slack/web-api')

// When you connect to rtm.connect or use Web API methods on behalf of your bot
// user, you should use this bot user access token instead of the top-level
// access token granted to your application.
// @see https://api.slack.com/docs/oauth#bots
// const BOT_USER_OAUTH_TOKEN = process.env.BOT_USER_OAUTH_TOKEN
const web = new WebClient(process.env.BOT_USER_OAUTH_TOKEN)

exports.handler = async function(event, context, callback) {
	const body = querystring.parse(event.body)

	// Respond as quickly as possible with a success code
	// @see https://api.slack.com/events-api#responding_to_events
	callback(null, { statusCode: 200 })

	// Generate a modal using Block Kit
	// @see https://api.slack.com/block-kit
	const viewPayload = {
		trigger_id: body.trigger_id,
		view: {
			type: 'modal',
			callback_id: 'modal-identifier',
			title: {
				type: 'plain_text',
				text: 'Enter PTO'
			},
			submit: {
				type: 'plain_text',
				text: 'Submit'
			},
			blocks: [
				{
					type: 'section',
					block_id: 'introduction_text',
					text: {
						type: 'mrkdwn',
						text: 'This will create an event on the Decipher PTO Calendar.'
					}
				},
				{
					type: 'input',
					block_id: 'description',
					optional: true,
					label: {
						type: 'plain_text',
						text: 'Description'
					},
					element: {
						type: 'plain_text_input',
						action_id: 'input'
					}
				},
				{
					type: 'input',
					block_id: 'start_date',
					element: {
						type: 'datepicker',
						action_id: 'date',
						placeholder: {
							type: 'plain_text',
							text: 'Select a date',
							emoji: true
						}
					},
					label: {
						type: 'plain_text',
						text: 'Start Date'
					}
				},
				{
					type: 'input',
					block_id: 'end_date',
					optional: true,
					element: {
						type: 'datepicker',
						action_id: 'date',
						placeholder: {
							type: 'plain_text',
							text: 'Select a date',
							emoji: true
						}
					},
					label: {
						type: 'plain_text',
						text: 'End Date'
					}
				}
			]
		}
	}

	web.views.open(viewPayload).catch(err => console.log('err', err))
}
