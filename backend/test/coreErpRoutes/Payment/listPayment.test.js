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

const mockList = jest.fn((req, res) => {
  return res.status(200).json({
    success: true,
    items: ['payment1', 'payment2'],
  });
});

// Dummy mocks
const mockCreate = jest.fn();
const mockRead = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockSearch = jest.fn();
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

const router = require('@/routes/appRoutes/appApi');

describe('PAYMENT LIST ROUTER API - MOCK TEST', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call paymentController.list and return 200', async () => {
    const res = await request(app).get('/payment/list');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      items: ['payment1', 'payment2'],
    });

    expect(mockList).toHaveBeenCalled();
  });
});
