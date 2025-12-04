const mongoose = require('mongoose');

jest.mock('mongoose');

const logout = require('@/controllers/middlewaresControllers/createAuthMiddleware/logout.js');

// Shared model stubs
const modelStubs = {
  AdminPassword: {
    findOneAndUpdate: jest.fn().mockImplementation(() => ({ exec: jest.fn().mockResolvedValue(true) })),
  },
};

jest.spyOn(mongoose, 'model').mockImplementation((name) => modelStubs[name] || {});

describe('Logout', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer testToken123',
      },
      admin: {
        _id: 'admin123',
      },
    };

    res = {
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================= TOKEN EXISTS =================
  it('Remove token from loggedSessions when authorization token exists', async () => {
    await logout(req, res, { userModel: 'Admin' });

    expect(modelStubs.AdminPassword.findOneAndUpdate).toHaveBeenCalledWith(
      { user: req.admin._id },
      { $pull: { loggedSessions: 'testToken123' } },
      { new: true }
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {},
      message: 'Successfully logout',
    });
  });

  // ================= NO TOKEN =================
  it('should clear all loggedSessions when token does NOT exist', async () => {
    req.headers.authorization = undefined;

    await logout(req, res, { userModel: 'Admin' });

    expect(modelStubs.AdminPassword.findOneAndUpdate).toHaveBeenCalledWith(
      { user: req.admin._id },
      { loggedSessions: [] },
      { new: true }
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {},
      message: 'Successfully logout',
    });
  });
});
