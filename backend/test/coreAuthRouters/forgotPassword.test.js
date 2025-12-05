const mongoose = require('mongoose');
const shortid = require('shortid');

jest.mock('mongoose');
jest.mock('shortid');

jest.mock('@/controllers/middlewaresControllers/createAuthMiddleware/sendMail.js', () => jest.fn());

jest.mock('@/settings/index', () => ({
  useAppSettings: jest.fn(),
}));

jest.mock('@/controllers/middlewaresControllers/createAuthMiddleware/checkAndCorrectURL', () => jest.fn());

const sendMail = require('@/controllers/middlewaresControllers/createAuthMiddleware/sendMail.js');
const { useAppSettings } = require('@/settings/index');
const checkAndCorrectURL = require('@/controllers/middlewaresControllers/createAuthMiddleware/checkAndCorrectURL');

const forgetPassword = require('@/controllers/middlewaresControllers/createAuthMiddleware/forgetPassword.js');

// Shared model stubs to ensure mongoose.model(name) returns same object
const modelStubs = {
  Admin: {
    findOne: jest.fn(),
  },
  AdminPassword: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn().mockImplementation(() => ({ exec: jest.fn().mockResolvedValue(true) })),
  },
};

jest.spyOn(mongoose, 'model').mockImplementation((name) => modelStubs[name] || {});

describe('FORGET PASSWORD CONTROLLER', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@gmail.com',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    useAppSettings.mockReturnValue({
      idurar_app_email: 'no-reply@test.com',
      idurar_base_url: 'http://localhost:3000',
    });

    checkAndCorrectURL.mockReturnValue('http://localhost:3000');
    shortid.generate.mockReturnValue('resetToken123');
    sendMail.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================= INVALID EMAIL =================
  it('Return 409 for invalid email', async () => {
    req.body.email = 'invalid-email';

    await forgetPassword(req, res, { userModel: 'Admin' });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid email.',
      })
    );
  });

  // ================= USER NOT FOUND =================
  it('Return 404 if user does not exist', async () => {
    modelStubs.Admin.findOne.mockResolvedValue(null);

    await forgetPassword(req, res, { userModel: 'Admin' });

    expect(modelStubs.Admin.findOne).toHaveBeenCalledWith({
      email: 'test@gmail.com',
      removed: false,
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });
  });

  // ================= SUCCESS CASE =================
  it('Generate reset token, save it and send mail', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@gmail.com',
    };

    modelStubs.Admin.findOne.mockResolvedValue(mockUser);
    modelStubs.AdminPassword.findOne.mockResolvedValue({ user: 'user123' });

    await forgetPassword(req, res, { userModel: 'Admin' });

    expect(shortid.generate).toHaveBeenCalled();

    expect(modelStubs.AdminPassword.findOneAndUpdate).toHaveBeenCalledWith(
      { user: mockUser._id },
      { resetToken: 'resetToken123' },
      { new: true }
    );

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@gmail.com',
        name: 'Test User',
        subject: 'Reset your password | idurar',
        link: 'http://localhost:3000/resetpassword/user123/resetToken123',
        idurar_app_email: 'no-reply@test.com',
        type: 'passwordVerfication',
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: null,
      message: 'Check your email inbox , to reset your password',
    });
  });
});
