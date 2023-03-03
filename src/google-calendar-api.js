// Load variables from the .env file into process.env
require('dotenv').config()
const path = require('path')

const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
const { now } = require('./utilities.js')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar']

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.resolve('auth/token.json')
const SECRET = path.resolve('auth/client_secret.json')

// Load client secrets from a local file.
fs.readFile(SECRET, (err, content) => {
	if (err) {
		return console.log('Error loading client secret file:', err)
	} else {
		// Authorize a client with credentials, then call the Google Calendar API.
		authorize(JSON.parse(content), listEvents)
	}
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize() {
	return new Promise(resolve => {
		const credentials = JSON.parse(fs.readFileSync(SECRET))
		const { client_secret, client_id, redirect_uris } = credentials.installed
		const oAuth2Client = new google.auth.OAuth2(
			client_id,
			client_secret,
			redirect_uris[0]
		)

		// Check if we have previously stored a token.
		fs.readFile(TOKEN_PATH, async (err, token) => {
			if (err) {
				getAccessToken(oAuth2Client, resolve)
			}

			oAuth2Client.setCredentials(JSON.parse(token))
			resolve(oAuth2Client)
		})
	})
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	})
	console.log('Authorize this app by visiting this url:', authUrl)
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})
	rl.question('Enter the code from that page here: ', code => {
		rl.close()
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err)
			oAuth2Client.setCredentials(token)
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
				if (err) return console.error(err)
				console.log('Token stored to', TOKEN_PATH)
			})
			callback(oAuth2Client)
		})
	})
}

/**
 * Get a list of events from our Google Calendar
 */
async function listEvents(options) {
	const auth = await authorize()
	const calendar = google.calendar({ version: 'v3', auth })

	// Reference: https://developers.google.com/calendar/v3/reference/events/list

	const defaultOptions = {
		calendarId: process.env.CALENDAR_ID,
		timeMin: now()
			.startOf('day')
			.format(),
		timeMax: now()
			.add(1, 'days')
			.startOf('day')
			.format(),
		singleEvents: true,
		orderBy: 'startTime',

		// The default. Listed here so that it's explicit. Max value is 2500.
		maxResults: 250
	}

	options = {
		...defaultOptions,
		...options
	}
	console.log('options', options)

	try {
		const response = await calendar.events.list(options)
		console.log('response', response)

		const events = response.data.items

		return events
	} catch (error) {
		console.log('error', error)

		return error
	}
}

async function createEvent(options) {
	const auth = await authorize()
	const calendar = google.calendar({ version: 'v3', auth })

	// Reference: https://developers.google.com/calendar/v3/reference/events/insert

	const defaultOptions = {
		calendarId: process.env.CALENDAR_ID
	}

	options = {
		...defaultOptions,
		...options
	}

	try {
		const response = await calendar.events.insert(options)

		return response
	} catch (error) {
		return error
	}
}

module.exports = {
	createEvent,
	listEvents
}
