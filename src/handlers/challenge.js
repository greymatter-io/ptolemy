// Use this to verify challenges when creating new endpoints for Slack
exports.handler = async function(event, context, callback) {
	const responseCode = 200
	console.log('event', event)
	console.log('context', context)

	const { challenge } = JSON.parse(event.body)

	const response = {
		statusCode: responseCode,
		body: challenge
	}

	console.log('response', response)
	callback(null, response)
}
