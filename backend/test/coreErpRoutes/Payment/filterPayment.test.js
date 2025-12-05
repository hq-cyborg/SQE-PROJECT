const request = require('supertest');
const express = require('express');

jest.mock('@/handlers/errorHandlers', () => ({
  catchErrors: (fn) => fn,
}));

jest.mock('@/models/utils', () => ({
  routesList: [
    { entity: 'payment', modelName: 'Payment', controllerName: 'paymentController' },
  ],
}));

const mockFilter = jest.fn((req, res) => {
  return res.status(200).json({
    success: true,
    filtered: ['payment2'],
  });
});

// Dummy mocks
const mockCreate = jest.fn();
const mockRead = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockSearch = jest.fn();
const mockList = jest.fn();
const mockListAll = jest.fn();
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

const router = require('@/routes/appRoutes/appApi');

describe('PAYMENT FILTER ROUTER API - MOCK TEST', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call paymentController.filter and return 200', async () => {
    const res = await request(app).get('/payment/filter');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      filtered: ['payment2'],
    });

    expect(mockFilter).toHaveBeenCalled();
  });
});
