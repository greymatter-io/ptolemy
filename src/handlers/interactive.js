// Load varaiables from the .env file into process.env
require('dotenv').config()

const querystring = require('querystring')
const { WebClient } = require('@slack/web-api')
const { createPTOEvent } = require('../actions.js')
const moment = require('moment')

// When you connect to rtm.connect or use Web API methods on behalf of your bot
// user, you should use this bot user access token instead of the top-level
// access token granted to your application.
// @see https://api.slack.com/docs/oauth#bots
const web = new WebClient(process.env.BOT_USER_OAUTH_TOKEN)

exports.handler = async function(event) {
	const body = querystring.parse(event.body)
	const payload = JSON.parse(body.payload)

	if (payload && payload.type === 'view_submission') {
		const {
			state: { values }
		} = payload.view

		const description = values.description.input.value
		const startDate = values.start_date.date.selected_date
		const endDate = values.end_date.date.selected_date

		// Get user info so that we can use the person's full name
		const userInfo = await web.users.info({ user: payload.user.id })
		const name = userInfo.user.real_name

		if (startDate > endDate) {
			const response = {
				response_action: 'errors',
				errors: {
					end_date: 'Your end date can’t be earlier than your start date.'
				}
			}
			return { statusCode: 200, body: JSON.stringify(response) }
		}

		const calendarResponse = await createPTOEvent({
			name,
			description,
			startDate,
			endDate
		})

		let message = ''
		if (calendarResponse.errors) {
			message = `Hmm: I got an error trying to create that calendar event for you.\n\n${JSON.stringify(
				calendarResponse.errors
			)}`
		} else {
			const duration = endDate
				? `from ${moment(startDate).format('L')} to ${moment(endDate).format(
						'L'
				  )}`
				: `on ${moment(startDate).format('L')}`
			message = `Awesome! I created a PTO event ${duration} for you on the PTO calendar.`
		}

		web.chat.postMessage({
			channel: payload.user.id,
			text: message
		})

		return { statusCode: 200 }
	} else {
		// Respond as quickly as possible with a success code
		// @see https://api.slack.com/events-api#responding_to_events
		return { statusCode: 200 }
	}
}
