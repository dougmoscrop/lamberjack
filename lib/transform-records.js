'use strict';

const stream = require('stream');

function tryParse(logEvent) {
  const { message } = logEvent;

  if (message) {
    try {
      const parsed = JSON.parse(logEvent.message);
      
      if (typeof parsed === 'object' && parsed) {
        return Promise.resolve(parsed);
      } else {
        return Promise.resolve({ message });
      }
    } catch (e) {
      return Promise.resolve({ message });
    }
  } else {
    throw new Error('missing logEvent.message');
  }
}

module.exports = function(fn = tryParse) {
  return new stream.Transform({
    objectMode: true,
    transform: function(logEvent, encoding, callback) {
      Promise.resolve()
        .then(() => {
          return fn(logEvent);
        })
        .then(transformed => {
          callback(null, JSON.stringify(transformed));
        })
        .catch(e => {
          callback(e);
        });
    }
  });
};
