const request = require('supertest');
const express = require('express');

/* ================= MOCK ERROR HANDLER ================= */
jest.mock('@/handlers/errorHandlers', () => ({
  catchErrors: (fn) => fn, // bypass error wrapper
}));

/* ================= MOCK ROUTES LIST ================= */
jest.mock('@/models/utils', () => ({
  routesList: [
    { entity: 'payment', modelName: 'Payment', controllerName: 'paymentController' },
  ],
}));

/* ================= MOCK CONTROLLER ================= */
const mockCreate = jest.fn((req, res) => {
  return res.status(201).json({
    success: true,
    result: req.body,
  });
});

// Dummy mocks to avoid crashes for other methods
const mockRead = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockSearch = jest.fn();
const mockList = jest.fn();
const mockListAll = jest.fn();
const mockFilter = jest.fn();
const mockSummary = jest.fn();
const mockMail = jest.fn();

jest.mock('@/controllers/appControllers', () => ({
  paymentController: {
    create: mockCreate,
    read: mockRead,
    update: mockUpdate,
    delete: mockDelete,
    search: mockSearch,
    list: mockList,
    listAll: mockListAll,
    filter: mockFilter,
    summary: mockSummary,
    mail: mockMail,
  },
}));

/* ================= IMPORT ROUTER AFTER ALL MOCKS ================= */
const router = require('@/routes/appRoutes/appApi');

describe('PAYMENT CREATE ROUTER API - MOCK TEST', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call paymentController.create and return 201', async () => {
    const payload = { amount: 500, method: 'card', description: 'Test payment' };

    const res = await request(app)
      .post('/payment/create')
      .send(payload);

    // ✅ Response check
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      result: payload,
    });

    // ✅ Controller call check
    expect(mockCreate).toHaveBeenCalled();
    expect(mockCreate.mock.calls[0][0].body).toEqual(payload);
  });
});
