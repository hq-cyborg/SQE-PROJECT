const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');

jest.mock('mongoose');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('shortid');


const resetPassword = require('@/controllers/middlewaresControllers/createAuthMiddleware/resetPassword.js');

// Shared model stubs
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

describe('RESET PASSWORD CONTROLLER', () => {
  let req, res;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';

    req = {
      body: {
        password: 'newPassword123',
        userId: 'user123',
        resetToken: 'resetToken123',
        remember: false,
      },
      hostname: 'localhost',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    shortid.generate
      .mockReturnValueOnce('salt123')
      .mockReturnValueOnce('emailToken123')
      .mockReturnValueOnce('newResetToken123');

    bcrypt.hashSync.mockReturnValue('hashedPassword123');

    jwt.sign.mockReturnValue('jwtToken123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================= USER DISABLED =================
  it('should return 409 if user is disabled', async () => {
    modelStubs.AdminPassword.findOne.mockResolvedValue({
      resetToken: 'resetToken123',
    });

    modelStubs.Admin.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'user123',
        enabled: false,
      }),
    });

    await resetPassword(req, res, { userModel: 'Admin' });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Your account is disabled, contact your account adminstrator',
      })
    );
  });

  // ================= USER OR PASSWORD NOT FOUND =================
  it('should return 404 if user or password record does not exist', async () => {
    modelStubs.AdminPassword.findOne.mockResolvedValue(null);

    modelStubs.Admin.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await resetPassword(req, res, { userModel: 'Admin' });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'No account with this email has been registered.',
      })
    );
  });

  // ================= INVALID RESET TOKEN =================
  it('should return 403 for invalid reset token', async () => {
    modelStubs.AdminPassword.findOne.mockResolvedValue({
      resetToken: 'wrongToken',
    });

    modelStubs.Admin.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'user123',
        enabled: true,
      }),
    });

    await resetPassword(req, res, { userModel: 'Admin' });

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid reset token',
      })
    );
  });

  // ================= JOI VALIDATION ERROR =================
  it('should return 409 if validation fails', async () => {
    req.body.password = ''; // ❌ invalid

    modelStubs.AdminPassword.findOne.mockResolvedValue({
      resetToken: 'resetToken123',
    });

    modelStubs.Admin.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'user123',
        enabled: true,
      }),
    });

    await resetPassword(req, res, { userModel: 'Admin' });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid reset password object',
      })
    );
  });

  // ================= SUCCESS CASE =================
  it('should successfully reset password and return token', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'Test',
      surname: 'User',
      role: 'admin',
      email: 'test@gmail.com',
      photo: 'photo.png',
      enabled: true,
    };

    const mockPassword = {
      resetToken: 'resetToken123',
    };

    modelStubs.AdminPassword.findOne.mockResolvedValue(mockPassword);

    modelStubs.Admin.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    await resetPassword(req, res, { userModel: 'Admin' });

    expect(bcrypt.hashSync).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalled();

    expect(modelStubs.AdminPassword.findOneAndUpdate).toHaveBeenCalledWith(
      { user: 'user123' },
      {
        $push: { loggedSessions: 'jwtToken123' },
        password: 'hashedPassword123',
        salt: 'salt123',
        emailToken: 'emailToken123',
        resetToken: 'newResetToken123',
        emailVerified: true,
      },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {
        _id: 'user123',
        name: 'Test',
        surname: 'User',
        role: 'admin',
        email: 'test@gmail.com',
        photo: 'photo.png',
        token: 'jwtToken123',
        maxAge: null,
      },
      message: 'Successfully resetPassword user',
    });
  });
});
