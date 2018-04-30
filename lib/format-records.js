'use strict';

const stream = require('stream');

module.exports = function() {
  return new stream.Transform({
    objectMode: true,
    transform: function(records, encoding, callback) {
      const formatted = [].concat(records).map(record => {
        return {
          Data: record
        };
      });

      callback(null, formatted);
    }
  });
};
