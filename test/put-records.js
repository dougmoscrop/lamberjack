'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');
const aws = require('aws-sdk-mock');
const intoStream = require('into-stream');

test.afterEach(() => {
  aws.restore('Firehose', 'putRecordBatch');
});

test.serial('works', t => {
  return new Promise((resolve, reject) => {
    const firehose = aws.mock('Firehose', 'putRecordBatch', (params, cb) => {
      cb(null, {});
    });
    
    const putRecords = proxyquire('../lib/put-records', {
      'aws-sdk': aws
    });

    const record = JSON.stringify({ message: 'test' });

    intoStream.obj([record])
      .pipe(putRecords({ deliveryStreamName: 'foo' }))
      .on('finish', () => {
        try {
          t.true(firehose.stub.calledOnce);
          resolve();
        } catch (e) {
          reject(e);
        }
      })
      .on('error', reject);
  });
});

test.serial('retries on failedPutCount', t => {
  return new Promise((resolve, reject) => {
    let callCount = 0;
    const firehose = aws.mock('Firehose', 'putRecordBatch', (params, cb) => {
      if (callCount === 0) {
        callCount++;
        const res = {
          FailedPutCount: 1,
          RequestResponses: [{
            ErrorCode: 'test',
            ErrorMessage: 'testing'
          }, {
            ErrorCode: null
          }]
        };
        cb(null, res);
      } else {
        cb(null, {});
      }
    });
    
    const putRecords = proxyquire('../lib/put-records', {
      'aws-sdk': aws
    });

    const firstRecord = JSON.stringify({ message: 'test' });
    const secondRecord = JSON.stringify({ message: 'test2' });

    intoStream.obj([[firstRecord, secondRecord]])
      .pipe(putRecords({ deliveryStreamName: 'foo' }))
      .on('finish', () => {
        try {
          t.true(firehose.stub.calledTwice);
          resolve();
        } catch (e) {
          reject(e);
        }
      })
      .on('error', reject);
  });
});

test.serial('rejects on error', t => {
  return new Promise((resolve, reject) => {
    const firehose = aws.mock('Firehose', 'putRecordBatch', (params, cb) => {
      cb(new Error('test'));
    });
    
    const putRecords = proxyquire('../lib/put-records', {
      'aws-sdk': aws
    });

    const record = JSON.stringify({ message: 'test' });

    intoStream.obj([record])
      .pipe(putRecords({ deliveryStreamName: 'foo' }))
      .on('finish', () => {
        t.fail('should not finish');
        reject();
      })
      .on('error', e => {
        t.true(firehose.stub.calledOnce);
        t.deepEqual(e.message, 'test');
        resolve();
      });
  });
});

test.serial('rejects when retryCountExceeded', t => {
  return new Promise(resolve => {
    const firehose = aws.mock('Firehose', 'putRecordBatch', (params, cb) => {
        cb(null, {
          FailedPutCount: 1,
          RequestResponses: [{
            ErrorCode: 'test',
            ErrorMessage: 'testing'
          }, {
            ErrorCode: null
          }]
        });
    });
    
    const putRecords = proxyquire('../lib/put-records', {
      'aws-sdk': aws
    });

    const firstRecord = JSON.stringify({ message: 'test' });
    const secondRecord = JSON.stringify({ message: 'test2' });

    intoStream.obj([[firstRecord, secondRecord]])
      .pipe(putRecords({ deliveryStreamName: 'foo', retryLimit: 2, retryDelay: 50 }))
      .on('error', e => {
        t.deepEqual(firehose.stub.callCount, 3);
        t.deepEqual(e, 'Retry limit exceeded');
        resolve();
      });
  });
});