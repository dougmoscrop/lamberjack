'use strict';

const { firehose } = require('aws-streams');

module.exports = function(deliveryStreamName, options = {}) {
  return new firehose.PutRecords(deliveryStreamName, options);
}