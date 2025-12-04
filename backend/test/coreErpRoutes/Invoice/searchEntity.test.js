const request = require('supertest');
const express = require('express');

/* ================= MOCK ERROR HANDLER ================= */
jest.mock('@/handlers/errorHandlers', () => ({
  catchErrors: (fn) => fn, // bypass error wrapper
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
    create: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn((req, res) => {
      const { query } = req.query;
      const results = query === 'test' ? [{ name: 'Test Invoice' }] : [];
      return res.status(200).json({
        success: true,
        results,
      });
    }),
    list: jest.fn(),
    listAll: jest.fn(),
    filter: jest.fn(),
    summary: jest.fn(),
    mail: jest.fn(),
  },
}));

/* ================= IMPORT ROUTER AFTER MOCKS ================= */
const router = require('@/routes/appRoutes/appApi');

describe('SEARCH ROUTER API - MOCK TEST', () => {
  let app;
  let mockSearch;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);

    const appControllers = require('@/controllers/appControllers');
    mockSearch = appControllers.invoiceController.search;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return search results for query "test"', async () => {
    const res = await request(app).get('/invoice/search').query({ query: 'test' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toEqual([{ name: 'Test Invoice' }]);

    expect(mockSearch).toHaveBeenCalled();
    expect(mockSearch.mock.calls[0][0].query.query).toBe('test');
  });

  it('should return empty results for unknown query', async () => {
    const res = await request(app).get('/invoice/search').query({ query: 'unknown' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toEqual([]);

    expect(mockSearch).toHaveBeenCalled();
    expect(mockSearch.mock.calls[0][0].query.query).toBe('unknown');
  });
});
