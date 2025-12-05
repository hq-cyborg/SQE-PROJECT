const { makeModelStub } = require('./_controllerTestHelpers');

jest.mock('@/models/utils', () => ({ modelsFiles: ['Invoice'] }));
jest.mock('mongoose', () => ({
  model: jest.fn(),
}));

describe('INVOICE DELETE CONTROLLER (unit)', () => {
  const loadRemoveController = () => {
    delete require.cache[require.resolve('@/controllers/middlewaresControllers/createCRUDController/remove')];
    return require('@/controllers/middlewaresControllers/createCRUDController/remove');
  };

  it('should delete invoice successfully (soft delete - set removed to true)', async () => {
    const mongoose = require('mongoose');
    const deleted = { _id: '12345', removed: true };

    const ModelStub = makeModelStub(null, null, deleted);
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    const remove = loadRemoveController();

    const req = { params: { id: '12345' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await remove(ModelStub, req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, result: deleted, message: 'Successfully Deleted the document ' })
    );
  });

  it('should return 404 if invoice not found', async () => {
    const mongoose = require('mongoose');
    const ModelStub = makeModelStub(null, null, null);
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    const remove = loadRemoveController();

    const req = { params: { id: 'notfound' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await remove(ModelStub, req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, result: null, message: 'No document found ' })
    );
  });

  it('should call findOneAndUpdate with correct parameters', async () => {
    const mongoose = require('mongoose');
    const deleted = { _id: '12345', removed: true };

    const ModelStub = makeModelStub(null, null, deleted);
    mongoose.model.mockImplementation((name) => (name === 'Invoice' ? ModelStub : {}));

    const remove = loadRemoveController();

    const req = { params: { id: '12345' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await remove(ModelStub, req, res);

    expect(ModelStub.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '12345' },
      { $set: { removed: true } },
      { new: true }
    );
  });
});