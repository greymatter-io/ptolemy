const chrono = require('chrono-node')
const { createEvent, listEvents } = require('./google-calendar-api.js')
const { now, section, TZ } = require('./utilities.js')
const moment = require('moment-timezone')

const helpMessage = {
	type: 'context',
	elements: [
		{
			type: 'mrkdwn',
			text: 'Type `/out help` for more information on how to use PTOlemy'
		}
	]
}

function isAllDay(event) {
	// Check for all-day events
	// @see https://stackoverflow.com/a/31420838/399077
	return !!event.start.date
}

module.exports = {
	outHelp: () =>
		JSON.stringify({
			blocks: [
				{ type: 'section', text: { type: 'mrkdwn', text: 'PTOlemy Help' } },
				{ type: 'divider' },
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: 'I offer the following commands:'
					}
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text:
							'`/out <date> [to <date>]`\nFind out who’s posted PTO for a given date range. I’ll do my best to parse the date however you state it, like ‘tomorrow,’ ‘next Thursday,’ or whatever.'
					}
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text:
							'`/out this week | next week`\nSpecial aliases to get PTO for this week or next week.'
					}
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text:
							'`/pto`\nLaunch a modal in Slack to create a PTO event that will be posted to the calendar.'
					}
				}
			]
		}),

	out: async dateRange => {
		if (!dateRange) {
			dateRange = 'today'
		}

		const rangeString = dateRange
		const rangeRegex = new RegExp(`\\s(?:to|till|'?til|until|through)\\s`)
		let range

		if (rangeString === 'this week') {
			range = [
				now()
					.startOf('week')
					.add(1, 'days'),
				now()
					.endOf('week')
					.subtract(1, 'days')
					.format()
			]
		} else if (rangeString === 'next week') {
			range = [
				now()
					.add(1, 'weeks')
					.startOf('week')
					.add(1, 'days'),
				now()
					.add(1, 'weeks')
					.endOf('week')
					.subtract(1, 'days')
					.format()
			]
		} else {
			range = rangeString.split(rangeRegex)
		}

		const [timeMin, timeMax = timeMin] = range
			.map(d => {
				const referenceDate = new Date()
				return typeof d === 'string'
					? chrono.parseDate(d, referenceDate, { forwardDate: true })
					: d
			})
			.map(d => {
				return moment(d).tz(TZ)
			})

		let events = await listEvents({
			// This querystring checks every field, and doesn't discriminate between
			// all-day events and regular ones. It helps keep the list of returned
			// events short, but we still need to filter afterward.
			timeMin: timeMin.format(),
			timeMax: timeMax.endOf('day').format()
		})

		const dateFormat = 'dddd, MMMM D'

		events = events.map(event => {
			let duration

			if (isAllDay(event)) {
				const startDate = moment(event.start.date).format(dateFormat)
				const endDate = moment(event.end.date)
					.subtract(1, 'days')
					.format(dateFormat)

				if (startDate !== endDate) {
					duration = `${startDate} – ${endDate}`
				} else {
					duration = startDate
				}
			} else {
				const timeFormat = 'h:mm a'

				const start = moment(event.start.dateTime).tz(TZ)
				const end = moment(event.end.dateTime).tz(TZ)

				duration = `${start.format(dateFormat)} (${start.format(
					timeFormat
				)} - ${end.format(timeFormat + ' z')})`
			}

			return {
				duration,
				event: event.summary
			}
		})

		const duration =
			timeMin === timeMax
				? `on ${timeMin.format(dateFormat)}`
				: `from ${timeMin.format(dateFormat)} to ${timeMax.format(dateFormat)}`

		if (events.length) {
			const blocks = []
			blocks.push(section(`*PTO ${duration}:*`))
			blocks.push({ type: 'divider' })

			events.forEach(event => {
				blocks.push(section(`*${event.event}*\n${event.duration}`))
			})

			blocks.push(helpMessage)

			return JSON.stringify({ blocks })
		} else {
			return JSON.stringify({
				blocks: [section(`Nobody’s out of the office ${duration}.`)]
			})
		}
	},
	createPTOEvent: async ({
		name,
		description = '',
		startDate,
		endDate = startDate
	}) => {
		// Reference: https://developers.google.com/calendar/v3/reference/events/insert

		return await createEvent({
			resource: {
				summary: `${name} PTO${description && ` - ${description}`}`,
				start: {
					date: startDate
				},
				end: {
					date: moment(endDate)
						.add(1, 'days')
						.format('YYYY-MM-DD')
				}
			}
		})
	}
}
