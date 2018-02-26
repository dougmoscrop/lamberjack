'use strict';

const zlib = require('zlib');

module.exports = function getLogEvents(event) {
  if (event && event.awslogs && event.awslogs.data !== undefined) {
    const payload = new Buffer(event.awslogs.data, 'base64');
    const unzipped = zlib.gunzipSync(payload)
    const parsed = JSON.parse(unzipped.toString('utf8'));

    if (parsed && typeof parsed === 'object') {
      if (parsed.messageType === 'DATA_MESSAGE') {
        return parsed.logEvents;
      }
      console.log('skipping non DATA_MESSAGE', JSON.stringify(parsed));
    } else {
      throw new Error('awslogs.data was not a JSON object');
    }
  }

  return [];
};
