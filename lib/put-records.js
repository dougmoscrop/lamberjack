'use strict';

const stream = require('stream');

const aws = require('aws-sdk');

const firehose = new aws.Firehose();

function backoff(delay, limit, attempt) {
  if (attempt < limit) {
    return new Promise(resolve => {
      const timeout = Math.round(Math.random() * delay * Math.pow(2, attempt));
      setTimeout(resolve, timeout);
    });
  }
  return Promise.reject('Retry limit exceeded');
}

module.exports = function (options) {
  const { deliveryStreamName, retryDelay = 200, retryLimit = 3 } = options;

  function putRecords(records, attempt = 0) {
    const params = {
      Records: records,
      DeliveryStreamName: deliveryStreamName
    };

    return firehose
      .putRecordBatch(params)
      .promise()
      .then(data => {
        if (data.FailedPutCount) {
          const responses = data.RequestResponses;

          const failedRecords = records.filter((record, index) => {
            const response = responses[index];

            if (response.ErrorCode) {
              return true;
            }
          });

          return backoff(retryDelay, retryLimit, attempt)
            .then(() => putRecords(failedRecords, attempt + 1));
        }
      });
    }
  
  return new stream.Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
      const records = [].concat(chunk);
  
      putRecords(records)
        .then(() => callback())
        .catch(e => callback(e));
    }
  });

};