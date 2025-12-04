const { makeModelStub } = require('./_controllerTestHelpers');

// Mock these BEFORE any module loads
jest.mock('@/middlewares/settings', () => ({
  increaseBySettingKey: jest.fn(),
}));
jest.mock('@/models/utils', () => ({ modelsFiles: ['Invoice'] }));
jest.mock('mongoose', () => ({
  model: jest.fn(),
}));

describe('INVOICE CREATE CONTROLLER (unit)', () => {
  it('should validate input, save model, update pdf and return result', async () => {
    // Require mongoose after mock is in place
    const mongoose = require('mongoose');

    const payload = {
      client: 'client123',
      number: 1,
      year: 2025,
      status: 'draft',
      notes: '',
      expiredDate: new Date().toISOString(),
      date: new Date().toISOString(),
      items: [
        { itemName: 'Item 1', description: '', quantity: 1, price: 100, total: 100 },
      ],
      taxRate: 0,
    };

    // Stubbed saved doc and update result
    const saved = { _id: 'new-invoice-id', ...payload };
    const updated = { _id: 'new-invoice-id', pdf: 'invoice-new-invoice-id.pdf', ...payload };

    const ModelStub = makeModelStub(saved, saved, updated);

    // Mock mongoose.model to return our stub for Invoice
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    // Clear require cache so we can load the controller fresh with mocked mongoose
    delete require.cache[require.resolve('@/controllers/appControllers/invoiceController/create')];

    // NOW require controller (it will use mocked mongoose.model)
    const create = require('@/controllers/appControllers/invoiceController/create');

    const req = { body: payload, admin: { _id: 'admin123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
