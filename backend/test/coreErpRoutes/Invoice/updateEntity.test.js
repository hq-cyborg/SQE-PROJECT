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
    update: jest.fn((req, res) => {
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
        result: { _id: id, name: req.body.name, amount: req.body.amount },
      });
    }),
    delete: jest.fn(),
    search: jest.fn(),
    list: jest.fn(),
    listAll: jest.fn(),
    filter: jest.fn(),
    summary: jest.fn(),
    mail: jest.fn(),
  },
}));

/* ================= IMPORT ROUTER AFTER MOCKS ================= */
const router = require('@/routes/appRoutes/appApi');

describe('UPDATE ROUTER API - MOCK TEST', () => {
  let app;
  let mockUpdate;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', router);

    const appControllers = require('@/controllers/appControllers');
    mockUpdate = appControllers.invoiceController.update;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update invoice successfully', async () => {
    const payload = { name: 'Updated Invoice', amount: 1000 };
    const res = await request(app).patch('/invoice/update/12345').send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result._id).toBe('12345');
    expect(res.body.result.name).toBe('Updated Invoice');
    expect(res.body.result.amount).toBe(1000);

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockUpdate.mock.calls[0][0].params.id).toBe('12345');
  });

  it('should return 404 if invoice not found', async () => {
    const payload = { name: 'Does not exist', amount: 0 };
    const res = await request(app).patch('/invoice/update/notfound').send(payload);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockUpdate.mock.calls[0][0].params.id).toBe('notfound');
  });
});
