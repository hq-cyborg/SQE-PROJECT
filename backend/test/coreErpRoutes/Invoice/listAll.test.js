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
    listAll: jest.fn((req, res) => {
      const data = Array.from({ length: 3 }, (_, i) => ({
        _id: i + 1,
        name: `Invoice ${i + 1}`,
      }));
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
    filter: jest.fn(),
    summary: jest.fn(),
    mail: jest.fn(),
  },
}));

/* ================= IMPORT ROUTER AFTER MOCKS ================= */
const router = require('@/routes/appRoutes/appApi');

describe('LISTALL ROUTER API - MOCK TEST', () => {
  let app;
  let mockListAll;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);

    const appControllers = require('@/controllers/appControllers');
    mockListAll = appControllers.invoiceController.listAll;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all invoices', async () => {
    const res = await request(app).get('/invoice/listAll');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBe(3);
    expect(res.body.results[0].name).toBe('Invoice 1');

    expect(mockListAll).toHaveBeenCalled();
  });
});
