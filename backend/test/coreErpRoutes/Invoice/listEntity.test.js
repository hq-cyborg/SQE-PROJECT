const { makeModelStub } = require('./_controllerTestHelpers');

jest.mock('@/models/utils', () => ({ modelsFiles: ['Invoice'] }));
jest.mock('mongoose', () => ({
  model: jest.fn(),
}));

describe('INVOICE PAGINATED LIST CONTROLLER (unit)', () => {
  const loadPaginatedListController = () => {
    delete require.cache[require.resolve('@/controllers/middlewaresControllers/createCRUDController/paginatedList')];
    return require('@/controllers/middlewaresControllers/createCRUDController/paginatedList');
  };

  it('should return paginated list with default params (page=1, limit=10)', async () => {
    const mongoose = require('mongoose');
    const invoices = Array.from({ length: 10 }, (_, i) => ({
      _id: i + 1,
      name: `Invoice ${i + 1}`,
      removed: false,
    }));

    const ModelStub = makeModelStub(null, null, null, 50, invoices);
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    const paginatedList = loadPaginatedListController();

    const req = { query: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await paginatedList(ModelStub, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: invoices,
        pagination: expect.objectContaining({ page: 1, pages: 5, count: 50 }),
      })
    );
  });

  it('should return paginated list with custom page and limit', async () => {
    const mongoose = require('mongoose');
    const invoices = Array.from({ length: 5 }, (_, i) => ({
      _id: i + 11,
      name: `Invoice ${i + 11}`,
      removed: false,
    }));

    const ModelStub = makeModelStub(null, null, null, 30, invoices);
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    const paginatedList = loadPaginatedListController();

    const req = { query: { page: 2, items: 5 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await paginatedList(ModelStub, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: invoices,
        pagination: expect.objectContaining({ page: 2, pages: 6, count: 30 }),
      })
    );
  });

  it('should return 203 when collection is empty', async () => {
    const mongoose = require('mongoose');
    const ModelStub = makeModelStub(null, null, null, 0, []);
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    const paginatedList = loadPaginatedListController();

    const req = { query: { page: 1, items: 10 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await paginatedList(ModelStub, req, res);

    expect(res.status).toHaveBeenCalledWith(203);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: [],
        message: 'Collection is Empty',
      })
    );
  });

  it('should filter by field using search query', async () => {
    const mongoose = require('mongoose');
    const invoices = [{ _id: 1, name: 'Test Invoice', removed: false }];

    const ModelStub = makeModelStub(null, null, null, 1, invoices);
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    const paginatedList = loadPaginatedListController();

    const req = { query: { page: 1, items: 10, fields: 'name', q: 'Test' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await paginatedList(ModelStub, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        result: invoices,
        pagination: expect.objectContaining({ page: 1, pages: 1, count: 1 }),
      })
    );
  });

  it('should apply sort parameters', async () => {
    const mongoose = require('mongoose');
    const invoices = [
      { _id: 1, name: 'Invoice A', enabled: true },
      { _id: 2, name: 'Invoice B', enabled: true },
    ];

    const ModelStub = makeModelStub(null, null, null, 2, invoices);
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    const paginatedList = loadPaginatedListController();

    const req = { query: { page: 1, items: 10, sortBy: 'name', sortValue: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await paginatedList(ModelStub, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should apply filter parameters', async () => {
    const mongoose = require('mongoose');
    const invoices = [{ _id: 1, name: 'Paid Invoice', paymentStatus: 'paid' }];

    const ModelStub = makeModelStub(null, null, null, 1, invoices);
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    const paginatedList = loadPaginatedListController();

    const req = { query: { page: 1, items: 10, filter: 'paymentStatus', equal: 'paid' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await paginatedList(ModelStub, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});