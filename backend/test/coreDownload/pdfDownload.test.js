const mongoose = require('mongoose');
const custom = require('@/controllers/pdfController/index.js');
const downloadPdf = require('@/handlers/downloadHandler/downloadPdf.js');
const express = require('express');
const request = require('supertest');

// ================= FORCE MOCKS =================
jest.mock('mongoose');
jest.mock('@/controllers/pdfController', () => ({
  generatePdf: jest.fn()
}));

// ================= ROUTER MOCK =================
const router = express.Router();
router.route('/:directory/:file').get(function (req, res) {
  try {
    const { directory, file } = req.params;
    const id = file.slice(directory.length + 1).slice(0, -4);
    downloadPdf(req, res, { directory, id });
  } catch (error) {
    return res.status(503).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
});

// ================= EXPRESS APP =================
const app = express();
app.use(express.json());
app.use('/', router);

// =================== MAIN TEST SUITE ===================

describe('DOWNLOAD PDF ROUTER + CONTROLLER', () => {

  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      download: jest.fn((path, cb) => cb && cb()),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Ensure supertest/Express response.download is mocked so router requests
    // do not touch the filesystem. This makes the router test deterministic.
    app.response.download = function (path, cb) {
      this.set('X-Mocked-Download', path);
      this.send('MOCK_DOWNLOAD');
      if (typeof cb === 'function') cb(null);
    };

    jest.clearAllMocks();
  });

  // ================= ROUTER TEST =================
  it('should correctly extract directory and id and call controller', async () => {
    // Ensure mongoose model exists and generatePdf is mocked so handler runs
    mongoose.models = { Invoice: true };
    mongoose.model.mockReturnValue({
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '12345' }) }),
    });

    custom.generatePdf.mockImplementation((model, opts, result, cb) => cb());

    const res = await request(app).get('/invoice/invoice-12345.pdf');

    // router should resolve and handler should call generatePdf
    expect(custom.generatePdf).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  // ================= MODEL DOES NOT EXIST =================
  it('should return 404 if model does not exist', async () => {
    mongoose.models = {}; 

    await downloadPdf(req, res, {
      directory: 'invoice',
      id: '123'
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Model 'Invoice' does not exist"
      })
    );
  });

  // ================= RECORD NOT FOUND =================
  it('should return 400 if record is not found', async () => {
    const execMock = jest.fn().mockResolvedValue(null);

    mongoose.models = { Invoice: true };
    mongoose.model.mockReturnValue({
      findOne: jest.fn().mockReturnValue({ exec: execMock })
    });

    await downloadPdf(req, res, {
      directory: 'invoice',
      id: '123'
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Required fields are not supplied'
      })
    );
  });

  // ================= INVALID BSON ID =================
  it('should return 400 on BSONTypeError', async () => {
    const execMock = jest.fn().mockRejectedValue({ name: 'BSONTypeError', message: 'Invalid ID' });

    mongoose.models = { Invoice: true };
    mongoose.model.mockReturnValue({
      findOne: jest.fn().mockReturnValue({ exec: execMock })
    });

    await downloadPdf(req, res, {
      directory: 'invoice',
      id: 'bad-id'
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid ID'
      })
    );
  });

  // ================= FILE NOT FOUND AFTER PDF GENERATION =================
  it('should return 500 when res.download fails', async () => {
    const execMock = jest.fn().mockResolvedValue({ _id: '123' });

    mongoose.models = { Invoice: true };
    mongoose.model.mockReturnValue({
      findOne: jest.fn().mockReturnValue({ exec: execMock })
    });

    custom.generatePdf.mockImplementation((model, opts, result, cb) => {
      cb();
    });

    res.download.mockImplementation((path, cb) => {
      cb(new Error('File missing'));
    });

    await downloadPdf(req, res, {
      directory: 'invoice',
      id: '123'
    });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Couldn't find file"
      })
    );
  });

  // ================= SUCCESS CASE =================
  it('should successfully generate PDF and download', async () => {
    const execMock = jest.fn().mockResolvedValue({ _id: '123' });

    mongoose.models = { Invoice: true };
    mongoose.model.mockReturnValue({
      findOne: jest.fn().mockReturnValue({ exec: execMock })
    });

    custom.generatePdf.mockImplementation((model, opts, result, cb) => {
      cb();
    });

    await downloadPdf(req, res, {
      directory: 'invoice',
      id: '123'
    });

    expect(custom.generatePdf).toHaveBeenCalled();
    expect(res.download).toHaveBeenCalled();
  });

  // ================= UNKNOWN SERVER ERROR =================
  it('should return 500 on unknown server error', async () => {
    mongoose.models = { Invoice: true };

    mongoose.model.mockImplementation(() => {
      throw new Error('Server crashed');
    });

    await downloadPdf(req, res, {
      directory: 'invoice',
      id: '123'
    });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Server crashed'
      })
    );
  });

});
