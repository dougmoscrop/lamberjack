'use strict';

const pump = require('pump-promise');
const intoStream = require('into-stream');
const batches = require('stream-batches');

const getLogEvents = require('./lib/get-log-events');
const transform = require('./lib/transform-records');
const put = require('./lib/put-records');

const MEGABYTE = 1024 * 1024;

const items = 500;
const bytes = 4 * MEGABYTE;

module.exports = (event, options = {}) => {
  const { deliveryStreamName, retry = {}, transformation } = options;

  if (deliveryStreamName) {
    const retryDelay = retry.delay;
    const retryLimit = retry.limit;

    const logEvents = getLogEvents(event);
    
    return pump(
      intoStream.obj(logEvents),
      transform(transformation),
      batches({ limit: { items, bytes } }),
      put({ deliveryStreamName, retryLimit, retryDelay })
    );
  }

  throw new Error('Missing deliveryStreamName in options');
};
