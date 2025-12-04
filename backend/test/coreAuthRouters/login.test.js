const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Mock low-level libs so that original authUser runs but no DB/crypto is used
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-jwt-token'),
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock mongoose.model to return in-memory model stubs (no DB access)
// Create shared stub models so repeated calls to mongoose.model(name)
// return the same object (like Mongoose does) and allow test overrides.
const modelStubs = {
  User: {
    findOne: jest.fn().mockResolvedValue({
      _id: '123',
      name: 'Admin',
      surname: 'User',
      role: 'admin',
      email: 'admin@test.com',
      removed: false,
      enabled: true,
      photo: null,
    }),
  },
  UserPassword: {
    findOne: jest.fn().mockResolvedValue({
      user: '123',
      password: 'hashedpassword',
      salt: 'somesalt',
      loggedSessions: [],
    }),
    // Return an object with exec() because authUser calls .exec()
    findOneAndUpdate: jest.fn().mockImplementation(() => ({ exec: jest.fn().mockResolvedValue(true) })),
  },
  Setting: {
    findOne: jest.fn().mockResolvedValue({ key: 'some_setting', value: 'mock_value' }),
  },
};

jest.spyOn(mongoose, 'model').mockImplementation((name) => {
  return modelStubs[name] || {};
});

// Import login AFTER mocks so authUser uses mocked bcrypt/jwt/mongoose
const login = require('@/controllers/middlewaresControllers/createAuthMiddleware/login');

// Setup Express app
const app = express();
app.use(bodyParser.json());
app.post('/api/login', (req, res) => login(req, res, { userModel: 'User' }));

describe('POST /api/login (call original authUser)', () => {
  beforeEach(() => {
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation(() => 'mocked-jwt-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with valid email and password', async () => {
    const response = await request(app).post('/api/login').send({ email: 'admin@test.com', password: 'admin123' });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.result).toHaveProperty('token', 'mocked-jwt-token');
    expect(response.body.result).toMatchObject({ _id: '123', email: 'admin@test.com' });
  });

  it('Fail: Email is missing', async () => {
    const res = await request(app).post('/api/login').send({ password: 'admin123' });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('Fail: Password is missing', async () => {
    const res = await request(app).post('/api/login').send({ email: 'admin@test.com' });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('Fail: With invalid credentials (user not found)', async () => {
    // Make User.findOne return null for this test
    mongoose.model('User').findOne.mockResolvedValueOnce(null);

    const res = await request(app).post('/api/login').send({ email: 'wrong@test.com', password: '123' });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('Fail: Incorrect password (bcrypt.compare false)', async () => {
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app).post('/api/login').send({ email: 'admin@test.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
