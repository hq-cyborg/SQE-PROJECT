const request = require('supertest');
const express = require('express');

/* ================= MOCK ERROR HANDLER ================= */
jest.mock('@/handlers/errorHandlers', () => ({
  catchErrors: (fn) => fn,
}));

/* ================= MOCK ROUTES LIST ================= */
jest.mock('@/models/utils', () => ({
  routesList: [
    { entity: 'invoice', modelName: 'Invoice', controllerName: 'invoiceController' },
  ],
}));

/* ================= MOCK CONTROLLERS ================= */
jest.mock('@/controllers/appControllers', () => ({
  invoiceController: {
    filter: jest.fn((req, res) => {
      const { minAmount } = req.query;
      const data = minAmount >= 100 ? [{ name: 'Invoice 1', amount: 150 }] : [];
      return res.status(200).json({
        success: true,
        results: data,
      });
    }),
    create: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    list: jest.fn(),
    listAll: jest.fn(),
    summary: jest.fn(),
    mail: jest.fn(),
  },
}));

/* ================= IMPORT ROUTER AFTER MOCKS ================= */
const router = require('@/routes/appRoutes/appApi');

describe('FILTER ROUTER API - MOCK TEST', () => {
  let app;
  let mockFilter;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);

    const appControllers = require('@/controllers/appControllers');
    mockFilter = appControllers.invoiceController.filter;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return filtered invoices based on minAmount', async () => {
    const res = await request(app).get('/invoice/filter').query({ minAmount: 100 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBe(1);
    expect(res.body.results[0].amount).toBe(150);

    expect(mockFilter).toHaveBeenCalled();
    expect(mockFilter.mock.calls[0][0].query.minAmount).toBe('100');
  });

  it('should return empty results for lower minAmount', async () => {
    const res = await request(app).get('/invoice/filter').query({ minAmount: 50 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBe(0);

    expect(mockFilter).toHaveBeenCalled();
  });
});
