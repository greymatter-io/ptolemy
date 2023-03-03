const actions = require('../src/actions.js')

jest.mock('../src/google-calendar-api.js')
const api = require('../src/google-calendar-api.js')

describe('out', () => {
	test('announces who is out', async () => {
		const events = [
			{
				summary: 'Nate PTO',
				start: { dateTime: '2020-06-30T13:00:00-04:00' },
				end: { dateTime: '2020-06-30T14:00:00-04:00' }
			},
			{
				summary: 'Elliot PTO',
				start: { date: '2020-10-11' },
				end: { date: '2020-10-12' }
			},
			{
				summary: 'Borncamp - Out in AM',
				start: {
					dateTime: '2020-06-22T10:30:00-04:00',
					timeZone: 'America/Denver'
				},
				end: {
					dateTime: '2020-06-22T13:30:00-04:00',
					timeZone: 'America/Denver'
				}
			},
			{
				summary: 'Nate PTO',
				start: {
					dateTime: '2020-10-11T13:00:00-04:00',
					timeZone: 'America/New_York'
				},
				end: {
					dateTime: '2020-10-11T14:00:00-04:00',
					timeZone: 'America/New_York'
				}
			}
		]

		api.listEvents.mockImplementation(() => events)

		// How many extra blocks are expected in the response
		const extraDisplayBlocks = 3

		const message = await actions.out('this week')
		const parsedMessage = JSON.parse(message)
		expect(parsedMessage.blocks.length).toEqual(
			extraDisplayBlocks + events.length
		)
		expect(parsedMessage.blocks[2].text.text).toEqual(
			'*Nate PTO*\nTuesday, June 30 (1:00 pm - 2:00 pm EDT)'
		)
	})
})
