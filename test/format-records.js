'use strict';


const test = require('ava');
const intoStream = require('into-stream');
const getStream = require('get-stream');

const transform = require('../lib/format-records');

test('leaves message as string', t => {
  const stream = intoStream.obj([['test']])
    .pipe(transform())

  return getStream.array(stream)
    .then(str => {
      t.deepEqual(str, [[{ Data: 'test' }]]);
    });
});