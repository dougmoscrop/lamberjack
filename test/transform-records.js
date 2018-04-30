'use strict';


const test = require('ava');
const intoStream = require('into-stream');
const getStream = require('get-stream');

const transform = require('../lib/transform-records');

test('throws when missing message', t => {
  const stream = intoStream.obj(['test'])
    .pipe(transform())

  return getStream.array(stream)
    .then(() => {
      t.fail('should not resolve');
    })
    .catch(err => {
      t.deepEqual(err.message, 'missing logEvent.message');
    });
});

test('leaves message as string', t => {
  const stream = intoStream.obj([{ id: 1, message: 'test' }])
    .pipe(transform())

  return getStream.array(stream)
    .then(str => {
      t.deepEqual(str, [JSON.stringify({ message: 'test' })]);
    });
});

test('parses message as object', t => {
  const stream = intoStream.obj([{ id: 1, message: JSON.stringify({ test: 'testing' }) }])
    .pipe(transform())

  return getStream.array(stream)
    .then(str => {
      t.deepEqual(str, [JSON.stringify({ test: 'testing' })]);
    });
});

test('does not parse a non-object message', t => {
  const stream = intoStream.obj([{ id: 1, message: JSON.stringify(null) }])
    .pipe(transform())

  return getStream.array(stream)
    .then(str => {
      t.deepEqual(str, [JSON.stringify({ message: 'null' })]);
    });
});