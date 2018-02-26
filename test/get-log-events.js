'use strict';

const zlib = require('zlib');

const test = require('ava');

const getLogEvents = require('../lib/get-log-events');

test('throws with empty string as data', t => {
  const data = '';

  t.throws(() => getLogEvents({ awslogs: { data }}), 'unexpected end of file');
});

test('throws with number data', t => {
  const data = 42;

  t.throws(() => getLogEvents({ awslogs: { data }}), 'If encoding is specified then the first argument must be a string');
});

test('throws with non-zipped data', t => {
  const data = 'banana';

  t.throws(() => getLogEvents({ awslogs: { data }}), 'incorrect header check');
});

test('throws with non-JSON data', t => {
  const data = zlib.gzipSync(Buffer.from('banana')).toString('base64');

  t.throws(() => getLogEvents({ awslogs: { data }}), 'Unexpected token b in JSON at position 0');
});

test('throws with non-object JSON data', t => {
  const data = zlib.gzipSync(Buffer.from('null')).toString('base64');

  t.throws(() => getLogEvents({ awslogs: { data }}), 'awslogs.data was not a JSON object');
});

test('returns empty logEvents without DATA_MESSAGE', t => {
  const data = zlib.gzipSync(Buffer.from(JSON.stringify({}))).toString('base64');

  const returned = getLogEvents({ awslogs: { data }});

  t.deepEqual(returned, []);
});

test('returns empty logEvents without awslogs.data', t => {
  const returned = getLogEvents({ awslogs: {} });

  t.deepEqual(returned, []);
});

test('resolves logEvents with DATA_MESSAGE', t => {
  const logEvents = [{ message: 'test' }];
  const data = zlib.gzipSync(Buffer.from(JSON.stringify({
    messageType: 'DATA_MESSAGE',
    logEvents
  }))).toString('base64');

  const returned = getLogEvents({ awslogs: { data }});

  t.deepEqual(returned, [{ message: 'test' }]);
});
