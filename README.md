```
  _____ _______ ____  _
 |  __ \__   __/ __ \| |
 | |__) | | | | |  | | | ___ _ __ ___  _   _
 |  ___/  | | | |  | | |/ _ \ '_ ` _ \| | | |
 | |      | | | |__| | |  __/ | | | | | |_| |
 |_|      |_|  \____/|_|\___|_| |_| |_|\__, |
                                        __/ |
                                       |___/
```

# Overview

PTOlemy is a Slackbot who interacts with Google Calendar. It periodically lets us
know about important things like who's on call and who's going to be out of the
office.

It also responds to specific slash commands on Slack.

# Slash Commands

Currently, PTOlemy responds to:

```
/out < today | this week | next week >
```

Slash Commands are managed via [api.slack.com](https://api.slack.com/apps/ABP7N7YLU/slash-commands?).

# Announcements

PTOlemy can make announcements by running `ptolemy.js` and passing `command` or `say` and
`channel` arguments.

```
  --command <command> Commands are specified as keys in `actions.js`
  --say "message"     Alternative to --command.
                      ptolemy will repeat whatever string she is given.
  --channel <channel> Available channels are specified in `.ptolemy.js`.
```

ptolemy's announcement schedule is currently run by the sudo crontab on `ml01`.

# Development

To prepare ptolemy to run locally or on a server, just install the necessary node modules:

```
npm i
```

The other side of ptolemy's functionality is her ability to respond. That's provided via an API Gateway on AWS that triggers one of ptolemy's lambdas. This deployment is handled via serverless, as configured in `serverless.yml`.

# Running Locally

It's very useful to be able to execute lambdas locally.

```
serverless invoke local --function responder -l --path sample_events/im.json
```

The above command specifies the function to invoke (`--function responder`), instructs it to output any console logging (`-l`) and gives it a path from which to grab data to send _to_ the lambda, so that you can mock what the lambda would receive once deployed.

# Deployment

You can deploy everything:

```
serverless deploy
```

Or a single function:

```
serverless deploy -f responder
```

# Testing

We're slowly getting ptolemy into a good spot with testing. Currently, it should be impossible to make a commit without passing current jest tests.

```
npm test
```

We also use prettier: we recommend setting up your editor to run prettier to reformat your code on save.
