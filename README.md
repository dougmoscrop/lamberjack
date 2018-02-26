# lamberjack

Ship your CloudWatch logs to Firehose for centralized logging, etc.

## Usage

`lamberjack(event, options)`

This library comes with sensible defaults, the only option required is the deliveryStreamName.

```js
const lamberjack = require('lamberjack')

module.exports.handler = (event, context, callback) => {
  lamberjack(event, { deliveryStreamName: 'test' })
    .then(() => callback())
    .catch(e => callback(e))
};
```

## Options

(as seen: default values)

```js
{
  retry: {
    delay: 200, // milliseconds, used exponentially in backoff
    limit: 3 // number of retries
  },
  transform: /* try to parse the JSON record, or { message } if not parsable */
}
```