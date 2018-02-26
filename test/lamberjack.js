'use strict';
'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');

test('throws when missing options', t => {
  const lamberjack = require('..');
  const err = t.throws(() => lamberjack());
  t.deepEqual(err.message, 'Missing deliveryStreamName in options');
});

test('resolves with no err', t => {
  const lamberjack = proxyquire('..', {
    './lib/get-log-events': () => []
  });

  return lamberjack({}, { deliveryStreamName: 'test' })
    .then(() => {
      t.pass();
    });
});