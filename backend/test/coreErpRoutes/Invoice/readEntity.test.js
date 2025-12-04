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
jest.mock('@/controllers/appControllers', () => {
  return {
    invoiceController: {
      create: jest.fn(),
      read: jest.fn((req, res) => {
        const { id } = req.params;
        if (id === 'notfound') {
          return res.status(404).json({
            success: false,
            message: 'Invoice not found',
            result: null,
          });
        }
        return res.status(200).json({
          success: true,
          result: { _id: id, name: 'Test Invoice', amount: 500 },
        });
      }),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      list: jest.fn(),
      listAll: jest.fn(),
      filter: jest.fn(),
      summary: jest.fn(),
      mail: jest.fn(),
    },
  };
});

/* ================= IMPORT ROUTER AFTER MOCKS ================= */
const router = require('@/routes/appRoutes/appApi');

describe('READ ROUTER API - MOCK TEST', () => {
  let app;
  let mockRead;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);

    // get reference to the mocked read function
    const appControllers = require('@/controllers/appControllers');
    mockRead = appControllers.invoiceController.read;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and invoice data', async () => {
    const res = await request(app).get('/invoice/read/12345');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result._id).toBe('12345');
    expect(res.body.result.name).toBe('Test Invoice');
    expect(res.body.result.amount).toBe(500);

    // Check if controller was called
    expect(mockRead).toHaveBeenCalled();
    expect(mockRead.mock.calls[0][0].params.id).toBe('12345');
  });

  it('should return 404 for non-existent invoice', async () => {
    const res = await request(app).get('/invoice/read/notfound');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);

    expect(mockRead).toHaveBeenCalled();
    expect(mockRead.mock.calls[0][0].params.id).toBe('notfound');
  });
});
