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
    summary: jest.fn((req, res) => {
      const summaryData = { totalInvoices: 5, totalAmount: 1000 };
      return res.status(200).json({
        success: true,
        summary: summaryData,
      });
    }),
    create: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    list: jest.fn(),
    listAll: jest.fn(),
    filter: jest.fn(),
    mail: jest.fn(),
  },
}));

/* ================= IMPORT ROUTER AFTER MOCKS ================= */
const router = require('@/routes/appRoutes/appApi');

describe('SUMMARY ROUTER API - MOCK TEST', () => {
  let app;
  let mockSummary;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);

    const appControllers = require('@/controllers/appControllers');
    mockSummary = appControllers.invoiceController.summary;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return invoice summary', async () => {
    const res = await request(app).get('/invoice/summary');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary.totalInvoices).toBe(5);
    expect(res.body.summary.totalAmount).toBe(1000);

    expect(mockSummary).toHaveBeenCalled();
  });
});
