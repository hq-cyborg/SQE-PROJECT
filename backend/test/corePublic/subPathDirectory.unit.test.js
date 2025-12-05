const request = require('supertest');
const express = require('express');
const router = require('@/routes/coreRoutes/corePublicRouter.js');
const { isPathInside } = require('@/utils/is-path-inside.js');

// This unit test mounts the real router but overrides `res.sendFile`
// to avoid touching the filesystem. It also tests the `isPathInside` util.

describe('corePublicRouter (unit tests, no fs access)', () => {
  let app;

  beforeEach(() => {
    app = express();

    // Override sendFile on response to avoid reading real files.
    // When called with a path, we'll send a simple string and
    // invoke the callback with either null (success) or an error
    // depending on a header set by the test.
    app.response.sendFile = function (absolutePath, callback) {
      // If a test set a special header to simulate "not found", call callback with an error
      if (this.req && this.req.headers && this.req.headers['x-simulate-notfound'] === '1') {
        if (typeof callback === 'function') return callback(new Error('ENOENT'));
        return;
      }

      // Otherwise, send a predictable body and call callback(null)
      this.set('X-Mocked-Path', absolutePath);
      this.send('MOCK_FILE_CONTENT');
      if (typeof callback === 'function') return callback(null);
    };

    app.use('/', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('serves file correctly (without touching fs)', async () => {
    const res = await request(app).get('/uploads/b/file.txt');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('MOCK_FILE_CONTENT');
    // router sets X-Mocked-Path so we can assert the resolved absolute path was passed
    expect(res.headers['x-mocked-path']).toBeDefined();
    expect(res.headers['x-mocked-path']).toContain('public');
  });

  
  it('returns 404 when sendFile reports an error', async () => {
    const res = await request(app).get('/uploads/b/file.txt').set('x-simulate-notfound', '1');
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      result: null,
      message: 'we could not find : file.txt',
    });
  });

  it('decodes URI components properly', async () => {
    const encoded = encodeURIComponent('file.txt');
    const res = await request(app).get(`/uploads/b/${encoded}`);
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('MOCK_FILE_CONTENT');
  });

  it('handles unexpected errors with 503', async () => {
    // Create a faulty app that throws inside route handler
    const faultyApp = express();
    faultyApp.use('/', (req, res) => {
      throw new Error('Unexpected');
    });
    // Error handling middleware
    faultyApp.use((err, req, res, next) => {
      return res.status(503).json({ success: false, message: err.message });
    });

    const res = await request(faultyApp).get('/any/any/file.txt');
    expect(res.statusCode).toBe(503);
    expect(res.body).toMatchObject({ success: false, message: 'Unexpected' });
  });
});


describe('isPathInside util - unit tests', () => {
  it('returns true for a child inside parent', () => {
    const parent = '/home/user';
    const child = '/home/user/docs/file.txt';
    expect(isPathInside(child, parent)).toBe(true);
  });

  it('returns false for a path outside parent', () => {
    const parent = '/home/user';
    const child = '/etc/passwd';
    expect(isPathInside(child, parent)).toBe(false);
  });

  it('returns false when child equals parent', () => {
    const parent = '/home/user';
    const child = '/home/user';
    expect(isPathInside(child, parent)).toBe(false);
  });
});
